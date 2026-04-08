"use server";

import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSessionOrThrow } from "@/lib/auth-utils";
import { isMedicRole } from "@/lib/roles";
import { db } from "@/db";
import { labResult } from "@/db/lab-result-schema";
import { resolvePatientUserId } from "@/lib/patient-utils";
import { labResultFormSchema } from "./data/schema";
import { generateLabResultAlerts } from "@/features/alerts/generate-alerts";

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
	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}
	const userId = await resolvePatientUserId(patientId);
	return db
		.select()
		.from(labResult)
		.where(eq(labResult.patientId, userId))
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

	await generateLabResultAlerts(session.user.id, parsed.data.tests);

	revalidatePath("/lab-results");
	revalidatePath("/alerts");
	return { success: true };
}

export async function createLabResultForPatient(
	patientId: string,
	values: unknown,
) {
	const session = await getSessionOrThrow();
	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}
	const parsed = labResultFormSchema.safeParse(values);
	if (!parsed.success) {
		return { error: "Date invalide." };
	}
	const userId = await resolvePatientUserId(patientId);
	await db.insert(labResult).values({
		id: crypto.randomUUID(),
		patientId: userId,
		...parsed.data,
	});

	await generateLabResultAlerts(userId, parsed.data.tests);

	revalidatePath(`/patients/${patientId}/lab-results`);
	revalidatePath("/alerts");
	return { success: true };
}

export async function deleteLabResult(id: string) {
	const session = await getSessionOrThrow();
	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}
	await db.delete(labResult).where(eq(labResult.id, id));
	revalidatePath("/lab-results");
	return { success: true };
}
