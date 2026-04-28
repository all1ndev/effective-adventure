"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { patient } from "@/db/patient-schema";
import { getSessionOrThrow } from "@/lib/auth-utils";
import { isPreTransplant } from "@/lib/transplant-status";

export async function getCurrentPatientTransplantStatus(): Promise<{
	transplantDate: string | null;
	isPreTransplant: boolean;
}> {
	const session = await getSessionOrThrow();
	const result = await db
		.select({ transplantDate: patient.transplantDate })
		.from(patient)
		.where(eq(patient.userId, session.user.id))
		.limit(1);

	const transplantDate = result[0]?.transplantDate ?? null;
	return {
		transplantDate,
		isPreTransplant: isPreTransplant(transplantDate),
	};
}
