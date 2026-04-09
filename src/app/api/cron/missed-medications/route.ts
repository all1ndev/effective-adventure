import { NextResponse } from "next/server";
import { db } from "@/db";
import { medication, medicationLog } from "@/db/medication-schema";
import { lte, or, isNull, gte } from "drizzle-orm";
import {
	isMedicationDueOnDate,
	getDailyDoseCount,
	getDueDatesInRange,
} from "@/features/medication/lib/medication-schedule";
import { generateMedicationAlerts } from "@/features/alerts/generate-alerts";

function formatDate(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export async function GET(request: Request) {
	// Verify cron secret
	const authHeader = request.headers.get("authorization");
	const cronSecret = process.env.CRON_SECRET;

	if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
	}

	const now = new Date();
	const today = formatDate(now);

	// Lookback: yesterday to 7 days ago
	const yesterday = new Date(now);
	yesterday.setDate(yesterday.getDate() - 1);
	const checkEnd = formatDate(yesterday);

	const weekAgo = new Date(now);
	weekAgo.setDate(weekAgo.getDate() - 7);
	const checkStart = formatDate(weekAgo);

	// Fetch all active medications in the date range
	const allMedications = await db
		.select()
		.from(medication)
		.where(lte(medication.startDate, checkEnd));

	// Filter by endDate in JS (drizzle doesn't handle nullable text comparison well)
	const activeMedications = allMedications.filter(
		(m) => !m.endDate || m.endDate >= checkStart,
	);

	if (activeMedications.length === 0) {
		return NextResponse.json({
			processed: 0,
			missed: 0,
			inserted: 0,
		});
	}

	// Fetch all existing logs in the date range
	const allLogs = await db.select().from(medicationLog);
	const logsInRange = allLogs.filter((l) => {
		const logDate = l.takenAt.substring(0, 10);
		return logDate >= checkStart && logDate <= checkEnd;
	});

	// Group logs by medicationId + date
	const logCountMap = new Map<string, number>();
	for (const log of logsInRange) {
		const logDate = log.takenAt.substring(0, 10);
		const key = `${log.medicationId}:${logDate}`;
		logCountMap.set(key, (logCountMap.get(key) ?? 0) + 1);
	}

	// Find missed doses
	const missedEntries: {
		medicationId: string;
		takenAt: string;
	}[] = [];

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

	return NextResponse.json({
		processed: activeMedications.length,
		missed: missedEntries.length,
		inserted: missedEntries.length,
		alertsGenerated: alertsToGenerate.length,
	});
}
