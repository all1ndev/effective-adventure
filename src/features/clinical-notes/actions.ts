"use server";

import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isMedicRole } from "@/lib/roles";
import { db } from "@/db";
import { clinicalNote } from "@/db/clinical-note-schema";
import { clinicalNoteFormSchema } from "./data/schema";

async function getSessionOrThrow() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		throw new Error("Neautorizat");
	}
	return session;
}

export async function getClinicalNotesByPatientId(patientId: string) {
	const session = await getSessionOrThrow();
	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}
	return db
		.select()
		.from(clinicalNote)
		.where(eq(clinicalNote.patientId, patientId))
		.orderBy(desc(clinicalNote.visitDate));
}

export async function createClinicalNote(patientId: string, values: unknown) {
	const session = await getSessionOrThrow();
	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}
	const parsed = clinicalNoteFormSchema.safeParse(values);
	if (!parsed.success) {
		return { error: "Date invalide." };
	}
	await db.insert(clinicalNote).values({
		id: crypto.randomUUID(),
		patientId,
		author: session.user.name,
		...parsed.data,
	});
	revalidatePath(`/patients/${patientId}/notes`);
	return { success: true };
}

export async function deleteClinicalNote(id: string) {
	const session = await getSessionOrThrow();
	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}
	await db.delete(clinicalNote).where(eq(clinicalNote.id, id));
	revalidatePath("/patients");
	return { success: true };
}
