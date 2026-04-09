import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and, lte, gte, inArray } from "drizzle-orm";
import { medication, medicationLog } from "@/db/medication-schema";
import { medicationReminder } from "@/db/medication-reminder-schema";
import { notificationQueue } from "@/db/notification-queue-schema";
import {
	isMedicationDueOnDate,
	getDailyDoseCount,
} from "@/features/medication/lib/medication-schedule";

function formatDate(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toRomaniaTime(date: Date): Date {
	// Convert UTC to Europe/Bucharest
	const romaniaStr = date.toLocaleString("en-US", {
		timeZone: "Europe/Bucharest",
	});
	return new Date(romaniaStr);
}

function getHHMM(date: Date): string {
	return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export async function GET(request: Request) {
	const authHeader = request.headers.get("authorization");
	const cronSecret = process.env.CRON_SECRET;

	if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
	}

	const nowUtc = new Date();
	const nowRo = toRomaniaTime(nowUtc);
	const today = formatDate(nowRo);
	const currentTime = getHHMM(nowRo);

	// Window: current time to +10 minutes
	const windowEnd = new Date(nowRo);
	windowEnd.setMinutes(windowEnd.getMinutes() + 10);
	const windowEndTime = getHHMM(windowEnd);

	// Follow-up window: 25-35 minutes ago
	const followupStart = new Date(nowRo);
	followupStart.setMinutes(followupStart.getMinutes() - 35);
	const followupStartTime = getHHMM(followupStart);

	const followupEnd = new Date(nowRo);
	followupEnd.setMinutes(followupEnd.getMinutes() - 25);
	const followupEndTime = getHHMM(followupEnd);

	// Fetch all enabled reminders with their medication
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
		})
		.from(medicationReminder)
		.innerJoin(medication, eq(medicationReminder.medicationId, medication.id))
		.where(eq(medicationReminder.enabled, true));

	if (allReminders.length === 0) {
		return NextResponse.json({ queued: 0, followups: 0 });
	}

	// Filter to medications due today
	const dueReminders = allReminders.filter((r) =>
		isMedicationDueOnDate(
			{
				frequency: r.medFrequency,
				startDate: r.medStartDate,
				endDate: r.medEndDate,
			},
			today,
		),
	);

	// Split into upcoming reminders and follow-up candidates
	const upcoming = dueReminders.filter((r) => {
		if (windowEndTime > currentTime) {
			// Normal case: no midnight crossing
			return r.time >= currentTime && r.time < windowEndTime;
		}
		// Midnight crossing (unlikely for 10-min window but safe)
		return r.time >= currentTime || r.time < windowEndTime;
	});

	const followupCandidates = dueReminders.filter((r) => {
		if (followupEndTime > followupStartTime) {
			return r.time >= followupStartTime && r.time < followupEndTime;
		}
		return r.time >= followupStartTime || r.time < followupEndTime;
	});

	// Deduplication: check existing queued notifications for today
	const todayStart = new Date(`${today}T00:00:00`);
	const todayEnd = new Date(`${today}T23:59:59`);

	const existingQueued = await db
		.select({
			sourceType: notificationQueue.sourceType,
			sourceId: notificationQueue.sourceId,
		})
		.from(notificationQueue)
		.where(
			and(
				gte(notificationQueue.scheduledFor, todayStart),
				lte(notificationQueue.scheduledFor, todayEnd),
				inArray(notificationQueue.sourceType, [
					"medication_reminder",
					"medication_reminder_followup",
				]),
			),
		);

	const queuedSet = new Set(
		existingQueued.map((q) => `${q.sourceType}:${q.sourceId}`),
	);

	// Queue upcoming reminders
	const toQueue: {
		id: string;
		userId: string;
		title: string;
		body: string;
		scheduledFor: Date;
		sourceType: string;
		sourceId: string;
	}[] = [];

	for (const r of upcoming) {
		const key = `medication_reminder:${r.reminderId}`;
		if (queuedSet.has(key)) continue;

		const doseCount = getDailyDoseCount(r.medFrequency);
		const doseLabel =
			doseCount > 1 ? ` (doza ${r.doseIndex + 1}/${doseCount})` : "";

		const scheduledFor = new Date(`${today}T${r.time}:00`);

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

	// Check follow-ups: see if doses were logged
	if (followupCandidates.length > 0) {
		const medIds = [...new Set(followupCandidates.map((r) => r.medicationId))];

		const todayLogs = await db
			.select()
			.from(medicationLog)
			.where(
				and(
					inArray(medicationLog.medicationId, medIds),
					gte(medicationLog.takenAt, today),
					lte(medicationLog.takenAt, `${today}T23:59:59`),
				),
			);

		// Count logs per medication for today
		const logCountMap = new Map<string, number>();
		for (const log of todayLogs) {
			const count = logCountMap.get(log.medicationId) ?? 0;
			logCountMap.set(log.medicationId, count + 1);
		}

		for (const r of followupCandidates) {
			const followupKey = `medication_reminder_followup:${r.reminderId}`;
			if (queuedSet.has(followupKey)) continue;

			const loggedCount = logCountMap.get(r.medicationId) ?? 0;

			// Dose index N needs at least N+1 logs
			if (loggedCount > r.doseIndex) continue;

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
