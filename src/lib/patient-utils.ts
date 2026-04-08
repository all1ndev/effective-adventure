import { eq } from "drizzle-orm";
import { db } from "@/db";
import { patient } from "@/db/patient-schema";

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
