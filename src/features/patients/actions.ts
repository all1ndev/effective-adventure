"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { patient } from "@/db/patient-schema";
import { patientFormSchema } from "./data/schema";
import { eq, asc } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

async function getSessionOrThrow() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		throw new Error("Neautorizat");
	}
	return session;
}

export async function getAdmins() {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	const { user } = await import("@/db/auth-schema");
	const admins = await db
		.select({ id: user.id, name: user.name, email: user.email })
		.from(user)
		.where(eq(user.role, "admin"))
		.orderBy(asc(user.name));

	return admins;
}

export async function getPatients() {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	return db.select().from(patient).orderBy(asc(patient.lastName));
}

export async function createPatient(values: unknown) {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	const parsed = patientFormSchema.safeParse(values);
	if (!parsed.success) {
		throw new Error("Date invalide");
	}

	await db.insert(patient).values({
		id: randomUUID(),
		...parsed.data,
	});

	revalidatePath("/patients");
}

export async function updatePatient(id: string, values: unknown) {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	const parsed = patientFormSchema.safeParse(values);
	if (!parsed.success) {
		throw new Error("Date invalide");
	}

	await db
		.update(patient)
		.set({
			...parsed.data,
			updatedAt: new Date(),
		})
		.where(eq(patient.id, id));

	revalidatePath("/patients");
}

export async function deletePatient(id: string) {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	await db.delete(patient).where(eq(patient.id, id));

	revalidatePath("/patients");
}
