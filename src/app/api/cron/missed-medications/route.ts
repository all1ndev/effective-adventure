import { NextResponse } from "next/server";
import { db } from "@/db";
import { medication, medicationLog } from "@/db/medication-schema";
import { user } from "@/db/auth-schema";
import { eq, lte, gte, and, inArray } from "drizzle-orm";
import {
	getDailyDoseCount,
	getDueDatesInRange,
} from "@/features/medication/lib/medication-schedule";
import { generateMedicationAlerts } from "@/features/alerts/generate-alerts";
import { toTimezone, formatDate } from "@/lib/timezone";

export async function GET(request: Request) {
	const authHeader = request.headers.get("authorization");
	const cronSecret = process.env.CRON_SECRET;

	if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
	}

	const nowUtc = new Date();

	// Fetch all medications with user timezone
	const allMedications = await db
		.select({
			id: medication.id,
			patientId: medication.patientId,
			name: medication.name,
			dose: medication.dose,
			frequency: medication.frequency,
			startDate: medication.startDate,
			endDate: medication.endDate,
			timezone: user.timezone,
		})
		.from(medication)
		.innerJoin(user, eq(medication.patientId, user.id));

	if (allMedications.length === 0) {
		return NextResponse.json({ processed: 0, missed: 0, inserted: 0 });
	}

	// Group medications by timezone to compute correct date ranges
	const tzGroups = new Map<string, (typeof allMedications)[number][]>();
	for (const med of allMedications) {
		const tz = med.timezone ?? "Europe/Bucharest";
		const group = tzGroups.get(tz) ?? [];
		group.push(med);
		tzGroups.set(tz, group);
	}

	let totalProcessed = 0;
	let totalMissed = 0;
	let totalInserted = 0;
	let totalAlerts = 0;

	for (const [tz, meds] of tzGroups) {
		const nowLocal = toTimezone(nowUtc, tz);

		// Lookback: yesterday to 7 days ago in user's timezone
		const yesterday = new Date(nowLocal);
		yesterday.setDate(yesterday.getDate() - 1);
		const checkEnd = formatDate(yesterday);

		const weekAgo = new Date(nowLocal);
		weekAgo.setDate(weekAgo.getDate() - 7);
		const checkStart = formatDate(weekAgo);

		// Filter to active medications in the date range
		const activeMedications = meds.filter(
			(m) => m.startDate <= checkEnd && (!m.endDate || m.endDate >= checkStart),
		);

		if (activeMedications.length === 0) continue;

		totalProcessed += activeMedications.length;

		// Fetch logs in the date range
		const medIds = activeMedications.map((m) => m.id);
		const logsInRange = await db
			.select()
			.from(medicationLog)
			.where(
				and(
					inArray(medicationLog.medicationId, medIds),
					gte(medicationLog.takenAt, checkStart),
					lte(medicationLog.takenAt, `${checkEnd}T23:59:59`),
				),
			);

		// Group logs by medicationId + date
		const logCountMap = new Map<string, number>();
		for (const log of logsInRange) {
			const logDate = log.takenAt.substring(0, 10);
			const key = `${log.medicationId}:${logDate}`;
			logCountMap.set(key, (logCountMap.get(key) ?? 0) + 1);
		}

		// Find missed doses
		const missedEntries: { medicationId: string; takenAt: string }[] = [];
		const alertsToGenerate: {
			patientId: string;
			medicationName: string;
		}[] = [];
		const alertedMeds = new Set<string>();

		for (const med of activeMedications) {
			const dueDates = getDueDatesInRange(med, checkStart, checkEnd);
			const expectedDoses = getDailyDoseCount(med.frequency);

			for (const dueDate of dueDates) {
				const key = `${med.id}:${dueDate}`;
				const loggedCount = logCountMap.get(key) ?? 0;
				const missingCount = expectedDoses - loggedCount;

				for (let i = 0; i < missingCount; i++) {
					missedEntries.push({
						medicationId: med.id,
						takenAt: `${dueDate}T23:59:00`,
					});
				}

				if (missingCount > 0 && !alertedMeds.has(med.id)) {
					alertedMeds.add(med.id);
					alertsToGenerate.push({
						patientId: med.patientId,
						medicationName: med.name,
					});
				}
			}
		}

		// Batch insert omis logs
		if (missedEntries.length > 0) {
			await db.insert(medicationLog).values(
				missedEntries.map((entry) => ({
					id: crypto.randomUUID(),
					medicationId: entry.medicationId,
					takenAt: entry.takenAt,
					status: "omis" as const,
				})),
			);
		}

		// Generate alerts
		await Promise.all(
			alertsToGenerate.map((a) =>
				generateMedicationAlerts(a.patientId, {
					medicationName: a.medicationName,
					status: "omis",
				}),
			),
		);

		totalMissed += missedEntries.length;
		totalInserted += missedEntries.length;
		totalAlerts += alertsToGenerate.length;
	}

	return NextResponse.json({
		processed: totalProcessed,
		missed: totalMissed,
		inserted: totalInserted,
		alertsGenerated: totalAlerts,
	});
}
