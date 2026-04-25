"use server";

import { eq, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSessionOrThrow } from "@/lib/auth-utils";
import { isMedicRole } from "@/lib/roles";
import { db } from "@/db";
import { alert } from "@/db/alert-schema";
import { patient } from "@/db/patient-schema";
import { logAudit } from "@/lib/audit";
import { assertDoctorOwnsPatientByUserId } from "@/lib/patient-utils";

export async function getAlerts() {
	const session = await getSessionOrThrow();
	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}

	if (session.user.role === "admin") {
		return db.select().from(alert).orderBy(desc(alert.createdAt));
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

	// Verify doctor owns the patient this alert belongs to
	const alertRecord = await db
		.select({ patientId: alert.patientId })
		.from(alert)
		.where(eq(alert.id, id))
		.limit(1);
	if (!alertRecord[0]) throw new Error("Alerta nu a fost găsită.");
	await assertDoctorOwnsPatientByUserId(
		session.user.role,
		session.user.id,
		alertRecord[0].patientId,
	);

	await db.update(alert).set({ dismissed: true }).where(eq(alert.id, id));

	await logAudit({
		userId: session.user.id,
		userName: session.user.name,
		userRole: session.user.role,
		action: "update",
		entity: "alert",
		entityId: id,
		description: `A respins o alertă`,
	});

	revalidatePath("/alerts");
	return { success: true };
}
