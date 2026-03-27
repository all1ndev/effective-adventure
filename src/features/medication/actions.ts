"use server";

import { eq, and, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { medication, medicationLog } from "@/db/medication-schema";
import { medicationFormSchema, medicationLogFormSchema } from "./data/schema";

async function getSessionOrThrow() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new Error("Neautorizat");
	}

	return session;
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

	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	return db
		.select()
		.from(medication)
		.where(eq(medication.patientId, patientId))
		.orderBy(desc(medication.startDate));
}

export async function createMedication(values: unknown) {
	const session = await getSessionOrThrow();
	const parsed = medicationFormSchema.safeParse(values);

	if (!parsed.success) {
		return { error: "Date invalide." };
	}

	await db.insert(medication).values({
		id: crypto.randomUUID(),
		patientId: session.user.id,
		...parsed.data,
	});

	revalidatePath("/medication");
	return { success: true };
}

export async function createMedicationForPatient(
	patientId: string,
	values: unknown,
) {
	const session = await getSessionOrThrow();

	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	const parsed = medicationFormSchema.safeParse(values);

	if (!parsed.success) {
		return { error: "Date invalide." };
	}

	await db.insert(medication).values({
		id: crypto.randomUUID(),
		patientId,
		...parsed.data,
	});

	revalidatePath(`/patients/${patientId}/medication`);
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
		return { error: "Inregistrarea nu a fost gasita." };
	}

	await db.update(medication).set(parsed.data).where(eq(medication.id, id));

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
		return { error: "Inregistrarea nu a fost gasita." };
	}

	await db.delete(medication).where(eq(medication.id, id));

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

	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	const patientMeds = await db
		.select({ id: medication.id })
		.from(medication)
		.where(eq(medication.patientId, patientId));

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
		return { error: "Medicamentul nu a fost gasit." };
	}

	await db.insert(medicationLog).values({
		id: crypto.randomUUID(),
		...parsed.data,
	});

	revalidatePath("/medication");
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
		return { error: "Nu sunt inregistrari de salvat." };
	}

	// Verify ownership of all medications
	const medIds = [...new Set(parsedEntries.map((e) => e.medicationId))];
	const userMeds = await db
		.select({ id: medication.id })
		.from(medication)
		.where(
			and(
				inArray(medication.id, medIds),
				eq(medication.patientId, session.user.id),
			),
		);

	if (userMeds.length !== medIds.length) {
		return { error: "Unele medicamente nu au fost gasite." };
	}

	await db.insert(medicationLog).values(
		parsedEntries.map((entry) => ({
			id: crypto.randomUUID(),
			...entry,
		})),
	);

	revalidatePath("/medication");
	return { success: true };
}
