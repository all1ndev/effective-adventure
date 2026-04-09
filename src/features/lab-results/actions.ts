"use server";

import { eq, desc } from "drizzle-orm";
import { getSessionOrThrow } from "@/lib/auth-utils";
import { isMedicRole } from "@/lib/roles";
import { db } from "@/db";
import { labResult } from "@/db/lab-result-schema";
import { resolvePatientUserId } from "@/lib/patient-utils";

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
