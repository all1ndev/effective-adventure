"use server";

import { eq, and, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSessionOrThrow } from "@/lib/auth-utils";
import { isMedicRole } from "@/lib/roles";
import { db } from "@/db";
import { medication, medicationLog } from "@/db/medication-schema";
import { medicationReminder } from "@/db/medication-reminder-schema";
import {
	resolvePatientUserId,
	assertDoctorOwnsPatient,
} from "@/lib/patient-utils";
import {
	medicationFormSchema,
	medicationLogFormSchema,
	upsertRemindersSchema,
	type MedicationFormValues,
} from "./data/schema";
import { generateMedicationAlerts } from "@/features/alerts/generate-alerts";
import { logAudit } from "@/lib/audit";
import { getDailyDoseCount } from "./lib/medication-schedule";

function sanitizeMedicationData(data: MedicationFormValues) {
	return {
		...data,
		endDate: data.endDate || null,
		notes: data.notes || null,
		category: data.category || "altele",
	};
}

const DEFAULT_DOSE_TIMES = ["08:00", "14:00", "20:00", "23:00"];

async function createDefaultReminders(medicationId: string, frequency: string) {
	const count = getDailyDoseCount(frequency);
	if (count === 0) return;

	await db.insert(medicationReminder).values(
		Array.from({ length: count }, (_, i) => ({
			id: crypto.randomUUID(),
			medicationId,
			doseIndex: i,
			time: DEFAULT_DOSE_TIMES[i] ?? "08:00",
			enabled: false,
		})),
	);
}

async function reconcileReminders(
	medicationId: string,
	newFrequency: string,
	oldFrequency: string,
) {
	const newCount = getDailyDoseCount(newFrequency);
	const oldCount = getDailyDoseCount(oldFrequency);
	if (newCount === oldCount) return;

	if (newCount < oldCount) {
		// Delete excess reminders
		const existing = await db
			.select()
			.from(medicationReminder)
			.where(eq(medicationReminder.medicationId, medicationId));

		const toDelete = existing
			.filter((r) => r.doseIndex >= newCount)
			.map((r) => r.id);

		if (toDelete.length > 0) {
			await db
				.delete(medicationReminder)
				.where(inArray(medicationReminder.id, toDelete));
		}
	} else {
		// Add new reminders for additional doses
		const newReminders = [];
		for (let i = oldCount; i < newCount; i++) {
			newReminders.push({
				id: crypto.randomUUID(),
				medicationId,
				doseIndex: i,
				time: DEFAULT_DOSE_TIMES[i] ?? "08:00",
				enabled: false,
			});
		}
		if (newReminders.length > 0) {
			await db.insert(medicationReminder).values(newReminders);
		}
	}
}

export async function getMedications() {
	const session = await getSessionOrThrow();

	return db
		.select()
		.from(medication)
		.where(eq(medication.patientId, session.user.id))
		.orderBy(desc(medication.startDate));
}

export async function getMedicationsByPatientId(patientId: string) {
	const session = await getSessionOrThrow();

	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}

	const userId = await resolvePatientUserId(patientId);

	return db
		.select()
		.from(medication)
		.where(eq(medication.patientId, userId))
		.orderBy(desc(medication.startDate));
}

export async function createMedication(values: unknown) {
	const session = await getSessionOrThrow();
	const parsed = medicationFormSchema.safeParse(values);

	if (!parsed.success) {
		return { error: "Date invalide." };
	}

	const medId = crypto.randomUUID();
	await db.insert(medication).values({
		id: medId,
		patientId: session.user.id,
		...sanitizeMedicationData(parsed.data),
	});

	await createDefaultReminders(medId, parsed.data.frequency);

	await logAudit({
		userId: session.user.id,
		userName: session.user.name,
		userRole: session.user.role,
		action: "create",
		entity: "medication",
		description: `A adăugat medicamentul ${parsed.data.name} (${parsed.data.dose}, ${parsed.data.frequency})`,
	});

	revalidatePath("/medication");
	return { success: true };
}

export async function createMedicationForPatient(
	patientId: string,
	values: unknown,
) {
	const session = await getSessionOrThrow();

	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}

	await assertDoctorOwnsPatient(session.user.role, session.user.id, patientId);

	const parsed = medicationFormSchema.safeParse(values);

	if (!parsed.success) {
		return { error: "Date invalide." };
	}

	const userId = await resolvePatientUserId(patientId);
	const sanitized = sanitizeMedicationData(parsed.data);
	const medId = crypto.randomUUID();

	await db.insert(medication).values({
		id: medId,
		patientId: userId,
		...sanitized,
	});

	await createDefaultReminders(medId, parsed.data.frequency);

	await logAudit({
		userId: session.user.id,
		userName: session.user.name,
		userRole: session.user.role,
		action: "create",
		entity: "medication",
		description: `A adăugat medicamentul ${sanitized.name} pentru pacient`,
	});

	revalidatePath(`/patients/${patientId}/medication`);
	revalidatePath("/medication");
	return { success: true };
}

export async function updateMedication(id: string, values: unknown) {
	const session = await getSessionOrThrow();
	const parsed = medicationFormSchema.safeParse(values);

	if (!parsed.success) {
		return { error: "Date invalide." };
	}

	const existing = await db
		.select()
		.from(medication)
		.where(
			and(eq(medication.id, id), eq(medication.patientId, session.user.id)),
		)
		.limit(1);

	if (existing.length === 0) {
		return { error: "Înregistrarea nu a fost găsită." };
	}

	const oldFrequency = existing[0].frequency;

	await db
		.update(medication)
		.set(sanitizeMedicationData(parsed.data))
		.where(eq(medication.id, id));

	await reconcileReminders(id, parsed.data.frequency, oldFrequency);

	await logAudit({
		userId: session.user.id,
		userName: session.user.name,
		userRole: session.user.role,
		action: "update",
		entity: "medication",
		entityId: id,
		description: `A actualizat medicamentul ${parsed.data.name}`,
	});

	revalidatePath("/medication");
	return { success: true };
}

export async function updateMedicationForPatient(
	patientId: string,
	id: string,
	values: unknown,
) {
	const session = await getSessionOrThrow();

	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}

	await assertDoctorOwnsPatient(session.user.role, session.user.id, patientId);

	const parsed = medicationFormSchema.safeParse(values);

	if (!parsed.success) {
		return { error: "Date invalide." };
	}

	const userId = await resolvePatientUserId(patientId);

	const existing = await db
		.select()
		.from(medication)
		.where(and(eq(medication.id, id), eq(medication.patientId, userId)))
		.limit(1);

	if (existing.length === 0) {
		return { error: "Înregistrarea nu a fost găsită." };
	}

	const oldFrequency = existing[0].frequency;

	await db
		.update(medication)
		.set(sanitizeMedicationData(parsed.data))
		.where(eq(medication.id, id));

	await reconcileReminders(id, parsed.data.frequency, oldFrequency);

	await logAudit({
		userId: session.user.id,
		userName: session.user.name,
		userRole: session.user.role,
		action: "update",
		entity: "medication",
		entityId: id,
		description: `A actualizat medicamentul ${parsed.data.name} pentru pacient`,
	});

	revalidatePath(`/patients/${patientId}/medication`);
	revalidatePath("/medication");
	return { success: true };
}

export async function deleteMedicationForPatient(
	patientId: string,
	id: string,
) {
	const session = await getSessionOrThrow();

	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}

	await assertDoctorOwnsPatient(session.user.role, session.user.id, patientId);

	const userId = await resolvePatientUserId(patientId);

	const existing = await db
		.select()
		.from(medication)
		.where(and(eq(medication.id, id), eq(medication.patientId, userId)))
		.limit(1);

	if (existing.length === 0) {
		return { error: "Înregistrarea nu a fost găsită." };
	}

	await db.delete(medication).where(eq(medication.id, id));

	await logAudit({
		userId: session.user.id,
		userName: session.user.name,
		userRole: session.user.role,
		action: "delete",
		entity: "medication",
		entityId: id,
		description: `A șters un medicament al pacientului`,
	});

	revalidatePath(`/patients/${patientId}/medication`);
	revalidatePath("/medication");
	return { success: true };
}

export async function deleteMedication(id: string) {
	const session = await getSessionOrThrow();

	const existing = await db
		.select()
		.from(medication)
		.where(
			and(eq(medication.id, id), eq(medication.patientId, session.user.id)),
		)
		.limit(1);

	if (existing.length === 0) {
		return { error: "Înregistrarea nu a fost găsită." };
	}

	await db.delete(medication).where(eq(medication.id, id));

	await logAudit({
		userId: session.user.id,
		userName: session.user.name,
		userRole: session.user.role,
		action: "delete",
		entity: "medication",
		entityId: id,
		description: `A șters un medicament`,
	});

	revalidatePath("/medication");
	return { success: true };
}

export async function getMedicationLogs() {
	const session = await getSessionOrThrow();

	const userMeds = await db
		.select({ id: medication.id })
		.from(medication)
		.where(eq(medication.patientId, session.user.id));

	const medIds = userMeds.map((m) => m.id);

	if (medIds.length === 0) {
		return [];
	}

	return db
		.select()
		.from(medicationLog)
		.where(inArray(medicationLog.medicationId, medIds))
		.orderBy(desc(medicationLog.createdAt));
}

export async function getMedicationLogsByPatientId(patientId: string) {
	const session = await getSessionOrThrow();

	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}

	const userId = await resolvePatientUserId(patientId);

	const patientMeds = await db
		.select({ id: medication.id })
		.from(medication)
		.where(eq(medication.patientId, userId));

	const medIds = patientMeds.map((m) => m.id);

	if (medIds.length === 0) {
		return [];
	}

	return db
		.select()
		.from(medicationLog)
		.where(inArray(medicationLog.medicationId, medIds))
		.orderBy(desc(medicationLog.createdAt));
}

export async function createMedicationLog(values: unknown) {
	const session = await getSessionOrThrow();
	const parsed = medicationLogFormSchema.safeParse(values);

	if (!parsed.success) {
		return { error: "Date invalide." };
	}

	// Verify ownership of the medication
	const med = await db
		.select()
		.from(medication)
		.where(
			and(
				eq(medication.id, parsed.data.medicationId),
				eq(medication.patientId, session.user.id),
			),
		)
		.limit(1);

	if (med.length === 0) {
		return { error: "Medicamentul nu a fost găsit." };
	}

	await db.insert(medicationLog).values({
		id: crypto.randomUUID(),
		...parsed.data,
	});

	await generateMedicationAlerts(session.user.id, {
		medicationName: med[0].name,
		status: parsed.data.status,
	});

	await logAudit({
		userId: session.user.id,
		userName: session.user.name,
		userRole: session.user.role,
		action: "create",
		entity: "medication_log",
		description: `A înregistrat ${med[0].name} cu status: ${parsed.data.status}`,
	});

	revalidatePath("/medication");
	revalidatePath("/alerts");
	return { success: true };
}

export async function createMedicationLogsBatch(values: unknown[]) {
	const session = await getSessionOrThrow();

	const parsedEntries = [];
	for (const value of values) {
		const parsed = medicationLogFormSchema.safeParse(value);
		if (!parsed.success) {
			return { error: "Date invalide." };
		}
		parsedEntries.push(parsed.data);
	}

	if (parsedEntries.length === 0) {
		return { error: "Nu sunt înregistrări de salvat." };
	}

	// Verify ownership of all medications
	const medIds = [...new Set(parsedEntries.map((e) => e.medicationId))];
	const userMeds = await db
		.select({ id: medication.id, name: medication.name })
		.from(medication)
		.where(
			and(
				inArray(medication.id, medIds),
				eq(medication.patientId, session.user.id),
			),
		);

	if (userMeds.length !== medIds.length) {
		return { error: "Unele medicamente nu au fost găsite." };
	}

	await db.insert(medicationLog).values(
		parsedEntries.map((entry) => ({
			id: crypto.randomUUID(),
			...entry,
		})),
	);

	// Generate alerts for missed/late medications
	const medNameMap = new Map(userMeds.map((m) => [m.id, m.name]));
	const alertPromises = parsedEntries
		.filter((entry) => entry.status !== "luat")
		.map((entry) =>
			generateMedicationAlerts(session.user.id, {
				medicationName: medNameMap.get(entry.medicationId) ?? "Necunoscut",
				status: entry.status,
			}),
		);
	await Promise.all(alertPromises);

	await logAudit({
		userId: session.user.id,
		userName: session.user.name,
		userRole: session.user.role,
		action: "create",
		entity: "medication_log",
		description: `A înregistrat jurnalul zilnic pentru ${parsedEntries.length} medicament(e)`,
	});

	revalidatePath("/medication");
	revalidatePath("/alerts");
	return { success: true };
}

export async function getMedicationReminders(medicationId: string) {
	const session = await getSessionOrThrow();

	// Verify ownership
	const med = await db
		.select({ id: medication.id })
		.from(medication)
		.where(
			and(
				eq(medication.id, medicationId),
				eq(medication.patientId, session.user.id),
			),
		)
		.limit(1);

	if (med.length === 0) {
		return [];
	}

	return db
		.select()
		.from(medicationReminder)
		.where(eq(medicationReminder.medicationId, medicationId));
}

export async function getMedicationRemindersForPatient(
	patientId: string,
	medicationId: string,
) {
	const session = await getSessionOrThrow();

	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}

	await assertDoctorOwnsPatient(session.user.role, session.user.id, patientId);

	const userId = await resolvePatientUserId(patientId);

	const med = await db
		.select({ id: medication.id })
		.from(medication)
		.where(
			and(eq(medication.id, medicationId), eq(medication.patientId, userId)),
		)
		.limit(1);

	if (med.length === 0) {
		return [];
	}

	return db
		.select()
		.from(medicationReminder)
		.where(eq(medicationReminder.medicationId, medicationId));
}

export async function upsertMedicationReminders(
	medicationId: string,
	values: unknown,
) {
	const session = await getSessionOrThrow();
	const parsed = upsertRemindersSchema.safeParse(values);

	if (!parsed.success) {
		return { error: "Date invalide." };
	}

	// Verify ownership
	const med = await db
		.select({ id: medication.id, name: medication.name })
		.from(medication)
		.where(
			and(
				eq(medication.id, medicationId),
				eq(medication.patientId, session.user.id),
			),
		)
		.limit(1);

	if (med.length === 0) {
		return { error: "Medicamentul nu a fost găsit." };
	}

	// Delete existing and re-insert
	await db
		.delete(medicationReminder)
		.where(eq(medicationReminder.medicationId, medicationId));

	if (parsed.data.length > 0) {
		await db.insert(medicationReminder).values(
			parsed.data.map((r) => ({
				id: crypto.randomUUID(),
				medicationId,
				doseIndex: r.doseIndex,
				time: r.time,
				enabled: r.enabled,
			})),
		);
	}

	await logAudit({
		userId: session.user.id,
		userName: session.user.name,
		userRole: session.user.role,
		action: "update",
		entity: "medication_reminder",
		entityId: medicationId,
		description: `A actualizat reminder-ele pentru ${med[0].name}`,
	});

	revalidatePath("/medication");
	return { success: true };
}
