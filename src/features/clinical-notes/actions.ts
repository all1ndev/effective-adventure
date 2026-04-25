"use server";

import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSessionOrThrow } from "@/lib/auth-utils";
import { isMedicRole } from "@/lib/roles";
import { db } from "@/db";
import { clinicalNote } from "@/db/clinical-note-schema";
import {
	resolvePatientUserId,
	assertDoctorOwnsPatient,
	assertDoctorOwnsPatientByUserId,
} from "@/lib/patient-utils";
import { clinicalNoteFormSchema } from "./data/schema";
import { logAudit } from "@/lib/audit";

export async function getClinicalNotesByPatientId(patientId: string) {
	const session = await getSessionOrThrow();
	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}
	await assertDoctorOwnsPatient(session.user.role, session.user.id, patientId);
	const userId = await resolvePatientUserId(patientId);
	return db
		.select()
		.from(clinicalNote)
		.where(eq(clinicalNote.patientId, userId))
		.orderBy(desc(clinicalNote.visitDate));
}

export async function createClinicalNote(patientId: string, values: unknown) {
	const session = await getSessionOrThrow();
	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}
	await assertDoctorOwnsPatient(session.user.role, session.user.id, patientId);
	const parsed = clinicalNoteFormSchema.safeParse(values);
	if (!parsed.success) {
		return { error: "Date invalide." };
	}
	const userId = await resolvePatientUserId(patientId);
	await db.insert(clinicalNote).values({
		id: crypto.randomUUID(),
		patientId: userId,
		author: session.user.name,
		...parsed.data,
	});
	await logAudit({
		userId: session.user.id,
		userName: session.user.name,
		userRole: session.user.role,
		action: "create",
		entity: "clinical_note",
		description: `A adăugat o notă clinică pentru pacient`,
	});

	revalidatePath(`/patients/${patientId}/notes`);
	return { success: true };
}

export async function deleteClinicalNote(id: string) {
	const session = await getSessionOrThrow();
	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}

	// Verify doctor owns the patient this note belongs to
	const note = await db
		.select({ patientId: clinicalNote.patientId })
		.from(clinicalNote)
		.where(eq(clinicalNote.id, id))
		.limit(1);
	if (!note[0]) throw new Error("Nota clinică nu a fost găsită.");
	await assertDoctorOwnsPatientByUserId(
		session.user.role,
		session.user.id,
		note[0].patientId,
	);

	await db.delete(clinicalNote).where(eq(clinicalNote.id, id));

	await logAudit({
		userId: session.user.id,
		userName: session.user.name,
		userRole: session.user.role,
		action: "delete",
		entity: "clinical_note",
		entityId: id,
		description: `A șters o notă clinică`,
	});

	revalidatePath("/patients");
	return { success: true };
}
