import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and, lte, gte, inArray } from "drizzle-orm";
import { medication, medicationLog } from "@/db/medication-schema";
import { medicationReminder } from "@/db/medication-reminder-schema";
import { notificationQueue } from "@/db/notification-queue-schema";
import { user } from "@/db/auth-schema";
import {
	isMedicationDueOnDate,
	getDailyDoseCount,
} from "@/features/medication/lib/medication-schedule";
import { toTimezone, formatDate, formatHHMM, toUTC } from "@/lib/timezone";

export async function GET(request: Request) {
	const authHeader = request.headers.get("authorization");
	const cronSecret = process.env.CRON_SECRET;

	if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
	}

	const nowUtc = new Date();

	// Fetch all enabled reminders with their medication and user timezone
	const allReminders = await db
		.select({
			reminderId: medicationReminder.id,
			medicationId: medicationReminder.medicationId,
			doseIndex: medicationReminder.doseIndex,
			time: medicationReminder.time,
			patientId: medication.patientId,
			medName: medication.name,
			medDose: medication.dose,
			medFrequency: medication.frequency,
			medStartDate: medication.startDate,
			medEndDate: medication.endDate,
			timezone: user.timezone,
		})
		.from(medicationReminder)
		.innerJoin(medication, eq(medicationReminder.medicationId, medication.id))
		.innerJoin(user, eq(medication.patientId, user.id))
		.where(eq(medicationReminder.enabled, true));

	if (allReminders.length === 0) {
		return NextResponse.json({ queued: 0, followups: 0 });
	}

	// Deduplication: get all medication reminder entries from the last 24h
	const oneDayAgo = new Date(nowUtc.getTime() - 24 * 60 * 60 * 1000);
	const existingQueued = await db
		.select({
			sourceType: notificationQueue.sourceType,
			sourceId: notificationQueue.sourceId,
		})
		.from(notificationQueue)
		.where(
			and(
				gte(notificationQueue.scheduledFor, oneDayAgo),
				lte(notificationQueue.scheduledFor, nowUtc),
				inArray(notificationQueue.sourceType, [
					"medication_reminder",
					"medication_reminder_followup",
				]),
			),
		);

	const queuedSet = new Set(
		existingQueued.map((q) => `${q.sourceType}:${q.sourceId}`),
	);

	const toQueue: {
		id: string;
		userId: string;
		title: string;
		body: string;
		scheduledFor: Date;
		sourceType: string;
		sourceId: string;
	}[] = [];

	// Process each reminder in the user's own timezone
	for (const r of allReminders) {
		const tz = r.timezone ?? "Europe/Bucharest";
		const nowLocal = toTimezone(nowUtc, tz);
		const today = formatDate(nowLocal);
		const currentTime = formatHHMM(nowLocal);

		// Check if medication is due today in user's timezone
		if (
			!isMedicationDueOnDate(
				{
					frequency: r.medFrequency,
					startDate: r.medStartDate,
					endDate: r.medEndDate,
				},
				today,
			)
		) {
			continue;
		}

		// Window: current time to +10 minutes
		const windowEnd = new Date(nowLocal);
		windowEnd.setMinutes(windowEnd.getMinutes() + 10);
		const windowEndTime = formatHHMM(windowEnd);

		const isUpcoming =
			windowEndTime > currentTime
				? r.time >= currentTime && r.time < windowEndTime
				: r.time >= currentTime || r.time < windowEndTime;

		if (isUpcoming) {
			const key = `medication_reminder:${r.reminderId}`;
			if (queuedSet.has(key)) continue;

			const doseCount = getDailyDoseCount(r.medFrequency);
			const doseLabel =
				doseCount > 1 ? ` (doza ${r.doseIndex + 1}/${doseCount})` : "";

			// Store scheduledFor as UTC
			const scheduledFor = toUTC(today, r.time, tz);

			toQueue.push({
				id: crypto.randomUUID(),
				userId: r.patientId,
				title: `Medicament: ${r.medName}`,
				body: `Este ora pentru ${r.medName} ${r.medDose}${doseLabel}.`,
				scheduledFor,
				sourceType: "medication_reminder",
				sourceId: r.reminderId,
			});

			queuedSet.add(key);
		}

		// Follow-up window: 25-35 minutes ago
		const followupStart = new Date(nowLocal);
		followupStart.setMinutes(followupStart.getMinutes() - 35);
		const followupStartTime = formatHHMM(followupStart);

		const followupEnd = new Date(nowLocal);
		followupEnd.setMinutes(followupEnd.getMinutes() - 25);
		const followupEndTime = formatHHMM(followupEnd);

		const isFollowup =
			followupEndTime > followupStartTime
				? r.time >= followupStartTime && r.time < followupEndTime
				: r.time >= followupStartTime || r.time < followupEndTime;

		if (isFollowup) {
			const followupKey = `medication_reminder_followup:${r.reminderId}`;
			if (queuedSet.has(followupKey)) continue;

			// Check if dose was logged today
			const todayLogs = await db
				.select()
				.from(medicationLog)
				.where(
					and(
						eq(medicationLog.medicationId, r.medicationId),
						gte(medicationLog.takenAt, today),
						lte(medicationLog.takenAt, `${today}T23:59:59`),
					),
				);

			if (todayLogs.length > r.doseIndex) continue;

			const doseCount = getDailyDoseCount(r.medFrequency);
			const doseLabel =
				doseCount > 1 ? ` (doza ${r.doseIndex + 1}/${doseCount})` : "";

			toQueue.push({
				id: crypto.randomUUID(),
				userId: r.patientId,
				title: `Reamintire: ${r.medName}`,
				body: `Nu ați confirmat ${r.medName} ${r.medDose}${doseLabel} programat la ${r.time}. Ați luat-o?`,
				scheduledFor: nowUtc,
				sourceType: "medication_reminder_followup",
				sourceId: r.reminderId,
			});

			queuedSet.add(followupKey);
		}
	}

	// Insert all queued notifications
	if (toQueue.length > 0) {
		await db.insert(notificationQueue).values(toQueue);
	}

	const remindersCount = toQueue.filter(
		(q) => q.sourceType === "medication_reminder",
	).length;
	const followupsCount = toQueue.filter(
		(q) => q.sourceType === "medication_reminder_followup",
	).length;

	return NextResponse.json({
		queued: remindersCount,
		followups: followupsCount,
	});
}
