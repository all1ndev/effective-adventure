"use server";

import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { vitalSign } from "@/db/vital-signs-schema";
import { vitalEntryFormSchema } from "./data/schema";
import {
	computeVitalStatus,
	generateVitalSignAlerts,
} from "@/features/alerts/generate-alerts";

async function getSessionOrThrow() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new Error("Neautorizat");
	}

	return session;
}

export async function createVitalSign(values: unknown) {
	const session = await getSessionOrThrow();
	const parsed = vitalEntryFormSchema.safeParse(values);

	if (!parsed.success) {
		return { error: "Date invalide." };
	}

	const today = new Date().toISOString().split("T")[0];
	const status = computeVitalStatus(parsed.data);

	await db.insert(vitalSign).values({
		id: crypto.randomUUID(),
		patientId: session.user.id,
		date: today,
		status,
		...parsed.data,
	});

	if (status !== "normal") {
		await generateVitalSignAlerts(session.user.id, parsed.data);
	}

	revalidatePath("/vital-signs");
	revalidatePath("/alerts");
	return { success: true, status };
}

export async function updateVitalSign(id: string, values: unknown) {
	const session = await getSessionOrThrow();
	const parsed = vitalEntryFormSchema.safeParse(values);

	if (!parsed.success) {
		return { error: "Date invalide." };
	}

	const existing = await db
		.select()
		.from(vitalSign)
		.where(and(eq(vitalSign.id, id), eq(vitalSign.patientId, session.user.id)))
		.limit(1);

	if (existing.length === 0) {
		return { error: "Inregistrarea nu a fost gasita." };
	}

	const status = computeVitalStatus(parsed.data);

	await db
		.update(vitalSign)
		.set({ ...parsed.data, status })
		.where(eq(vitalSign.id, id));

	if (status !== "normal") {
		await generateVitalSignAlerts(session.user.id, parsed.data);
	}

	revalidatePath("/vital-signs");
	revalidatePath("/alerts");
	return { success: true, status };
}

export async function deleteVitalSign(id: string) {
	const session = await getSessionOrThrow();

	const existing = await db
		.select()
		.from(vitalSign)
		.where(and(eq(vitalSign.id, id), eq(vitalSign.patientId, session.user.id)))
		.limit(1);

	if (existing.length === 0) {
		return { error: "Inregistrarea nu a fost gasita." };
	}

	await db.delete(vitalSign).where(eq(vitalSign.id, id));

	revalidatePath("/vital-signs");
	return { success: true };
}

export async function getVitalSigns() {
	const session = await getSessionOrThrow();

	return db
		.select()
		.from(vitalSign)
		.where(eq(vitalSign.patientId, session.user.id))
		.orderBy(desc(vitalSign.date));
}

export async function getVitalSignsByPatientId(patientId: string) {
	const session = await getSessionOrThrow();

	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	return db
		.select()
		.from(vitalSign)
		.where(eq(vitalSign.patientId, patientId))
		.orderBy(desc(vitalSign.date));
}
