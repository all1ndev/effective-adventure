"use server";

import { eq, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isMedicRole } from "@/lib/roles";
import { db } from "@/db";
import { alert } from "@/db/alert-schema";
import { patient } from "@/db/patient-schema";

async function getSessionOrThrow() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		throw new Error("Neautorizat");
	}
	return session;
}

export async function getAlerts() {
	const session = await getSessionOrThrow();
	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}

	const doctorPatients = await db
		.select({ userId: patient.userId })
		.from(patient)
		.where(eq(patient.doctorId, session.user.id));

	const patientUserIds = doctorPatients
		.map((p) => p.userId)
		.filter((id): id is string => id !== null);

	if (patientUserIds.length === 0) return [];

	return db
		.select()
		.from(alert)
		.where(inArray(alert.patientId, patientUserIds))
		.orderBy(desc(alert.createdAt));
}

export async function dismissAlert(id: string) {
	const session = await getSessionOrThrow();
	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}
	await db.update(alert).set({ dismissed: true }).where(eq(alert.id, id));
	revalidatePath("/alerts");
	return { success: true };
}
