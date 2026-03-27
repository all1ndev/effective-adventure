"use server";

import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { symptomReport } from "@/db/symptoms-schema";
import { symptomReportFormSchema } from "./data/schema";

async function getSessionOrThrow() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new Error("Neautorizat");
	}

	return session;
}

export async function createSymptomReport(values: unknown) {
	const session = await getSessionOrThrow();
	const parsed = symptomReportFormSchema.safeParse(values);

	if (!parsed.success) {
		return { error: "Date invalide." };
	}

	const today = new Date().toISOString().split("T")[0];

	await db.insert(symptomReport).values({
		id: crypto.randomUUID(),
		patientId: session.user.id,
		date: today,
		...parsed.data,
	});

	revalidatePath("/symptoms");
	return { success: true };
}

export async function updateSymptomReport(id: string, values: unknown) {
	const session = await getSessionOrThrow();
	const parsed = symptomReportFormSchema.safeParse(values);

	if (!parsed.success) {
		return { error: "Date invalide." };
	}

	const existing = await db
		.select()
		.from(symptomReport)
		.where(
			and(
				eq(symptomReport.id, id),
				eq(symptomReport.patientId, session.user.id),
			),
		)
		.limit(1);

	if (existing.length === 0) {
		return { error: "Inregistrarea nu a fost gasita." };
	}

	await db
		.update(symptomReport)
		.set(parsed.data)
		.where(eq(symptomReport.id, id));

	revalidatePath("/symptoms");
	return { success: true };
}

export async function deleteSymptomReport(id: string) {
	const session = await getSessionOrThrow();

	const existing = await db
		.select()
		.from(symptomReport)
		.where(
			and(
				eq(symptomReport.id, id),
				eq(symptomReport.patientId, session.user.id),
			),
		)
		.limit(1);

	if (existing.length === 0) {
		return { error: "Inregistrarea nu a fost gasita." };
	}

	await db.delete(symptomReport).where(eq(symptomReport.id, id));

	revalidatePath("/symptoms");
	return { success: true };
}

export async function getSymptomReports() {
	const session = await getSessionOrThrow();

	return db
		.select()
		.from(symptomReport)
		.where(eq(symptomReport.patientId, session.user.id))
		.orderBy(desc(symptomReport.date));
}

export async function getSymptomReportsByPatientId(patientId: string) {
	const session = await getSessionOrThrow();

	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	return db
		.select()
		.from(symptomReport)
		.where(eq(symptomReport.patientId, patientId))
		.orderBy(desc(symptomReport.date));
}
