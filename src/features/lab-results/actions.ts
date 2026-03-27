"use server";

import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { labResult } from "@/db/lab-result-schema";
import { labResultFormSchema } from "./data/schema";

async function getSessionOrThrow() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		throw new Error("Neautorizat");
	}
	return session;
}

export async function getLabResults() {
	const session = await getSessionOrThrow();
	return db
		.select()
		.from(labResult)
		.where(eq(labResult.patientId, session.user.id))
		.orderBy(desc(labResult.date));
}

export async function getLabResultsByPatientId(patientId: string) {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}
	return db
		.select()
		.from(labResult)
		.where(eq(labResult.patientId, patientId))
		.orderBy(desc(labResult.date));
}

export async function createLabResult(values: unknown) {
	const session = await getSessionOrThrow();
	const parsed = labResultFormSchema.safeParse(values);
	if (!parsed.success) {
		return { error: "Date invalide." };
	}
	await db.insert(labResult).values({
		id: crypto.randomUUID(),
		patientId: session.user.id,
		...parsed.data,
	});
	revalidatePath("/lab-results");
	return { success: true };
}

export async function createLabResultForPatient(
	patientId: string,
	values: unknown,
) {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}
	const parsed = labResultFormSchema.safeParse(values);
	if (!parsed.success) {
		return { error: "Date invalide." };
	}
	await db.insert(labResult).values({
		id: crypto.randomUUID(),
		patientId,
		...parsed.data,
	});
	revalidatePath(`/patients/${patientId}/lab-results`);
	return { success: true };
}

export async function deleteLabResult(id: string) {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}
	await db.delete(labResult).where(eq(labResult.id, id));
	revalidatePath("/lab-results");
	return { success: true };
}
