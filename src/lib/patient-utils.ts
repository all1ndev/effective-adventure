import { eq } from "drizzle-orm";
import { db } from "@/db";
import { patient } from "@/db/patient-schema";
import { isPreTransplant } from "@/lib/transplant-status";

/**
 * Resolves a patient table ID to the associated user ID.
 * All data tables (medication, vital_sign, symptom_report, etc.)
 * reference user.id as their patientId foreign key,
 * but URL params use patient.id.
 */
export async function resolvePatientUserId(patientId: string): Promise<string> {
	const result = await db
		.select({ userId: patient.userId })
		.from(patient)
		.where(eq(patient.id, patientId))
		.limit(1);

	const userId = result[0]?.userId;
	if (!userId) {
		throw new Error("Pacientul nu are un cont de utilizator asociat.");
	}
	return userId;
}

/**
 * Verifies that a doctor owns the patient (by patient table ID).
 * Admins are always allowed. Throws if unauthorized.
 */
export async function assertDoctorOwnsPatient(
	role: string | null | undefined,
	doctorUserId: string | null | undefined,
	patientTableId: string,
): Promise<void> {
	if (role === "admin") return;

	const record = await db
		.select({ doctorId: patient.doctorId })
		.from(patient)
		.where(eq(patient.id, patientTableId))
		.limit(1);

	if (!record[0]) {
		throw new Error("Pacientul nu a fost găsit.");
	}
	if (record[0].doctorId !== doctorUserId) {
		throw new Error("Neautorizat");
	}
}

/**
 * Blocks pre-transplant patients from post-transplant-only features.
 * Only checks when role is "user" (the patient themselves). No-op for doctors/admins.
 */
export async function assertPatientNotPreTransplant(
	role: string | null | undefined,
	userId: string,
): Promise<void> {
	if (role !== "user") return;
	const result = await db
		.select({ transplantDate: patient.transplantDate })
		.from(patient)
		.where(eq(patient.userId, userId))
		.limit(1);
	if (isPreTransplant(result[0]?.transplantDate ?? null)) {
		throw new Error("Funcționalitate disponibilă doar după transplant.");
	}
}

/**
 * Same as assertDoctorOwnsPatient but looks up by user ID instead of patient table ID.
 */
export async function assertDoctorOwnsPatientByUserId(
	role: string | null | undefined,
	doctorUserId: string | null | undefined,
	patientUserId: string,
): Promise<void> {
	if (role === "admin") return;

	const record = await db
		.select({ doctorId: patient.doctorId })
		.from(patient)
		.where(eq(patient.userId, patientUserId))
		.limit(1);

	if (!record[0]) {
		throw new Error("Pacientul nu a fost găsit.");
	}
	if (record[0].doctorId !== doctorUserId) {
		throw new Error("Neautorizat");
	}
}
