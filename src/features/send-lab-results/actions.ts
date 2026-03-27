"use server";

import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { patient } from "@/db/patient-schema";
import { labResult } from "@/db/lab-result-schema";

async function getSessionOrThrow() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		throw new Error("Neautorizat");
	}
	return session;
}

export async function getDoctorPatients() {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	return db
		.select({
			id: patient.id,
			userId: patient.userId,
			firstName: patient.firstName,
			lastName: patient.lastName,
			patientCode: patient.patientCode,
		})
		.from(patient)
		.where(eq(patient.doctorId, session.user.id))
		.orderBy(asc(patient.lastName));
}

export async function createLabResultWithPdf(values: {
	patientId: string;
	date: string;
	pdfFileName: string;
}) {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	if (!values.patientId || !values.date || !values.pdfFileName) {
		return { error: "Toate câmpurile sunt obligatorii." };
	}

	await db.insert(labResult).values({
		id: crypto.randomUUID(),
		patientId: values.patientId,
		date: values.date,
		tests: [],
		pdfFileName: values.pdfFileName,
	});

	revalidatePath("/lab-results");
	revalidatePath(`/patients/${values.patientId}/lab-results`);
	revalidatePath("/send-lab-results");
	return { success: true };
}
