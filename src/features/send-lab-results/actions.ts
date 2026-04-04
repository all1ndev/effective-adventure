"use server";

import { eq, asc, desc, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSessionOrThrow } from "@/lib/auth-utils";
import { isMedicRole } from "@/lib/roles";
import { db } from "@/db";
import { patient } from "@/db/patient-schema";
import { labResult } from "@/db/lab-result-schema";
import { user } from "@/db/auth-schema";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function getDoctorPatients() {
	const session = await getSessionOrThrow();
	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}

	const baseQuery = db
		.select({
			id: patient.id,
			userId: patient.userId,
			firstName: patient.firstName,
			lastName: patient.lastName,
			patientCode: patient.patientCode,
		})
		.from(patient);

	if (session.user.role === "admin") {
		return baseQuery.orderBy(asc(patient.lastName));
	}

	return baseQuery
		.where(eq(patient.doctorId, session.user.id))
		.orderBy(asc(patient.lastName));
}

export async function createLabResultWithPdf(values: {
	patientId: string;
	date: string;
	pdfFileName: string;
}) {
	const session = await getSessionOrThrow();
	if (!isMedicRole(session.user.role)) {
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

export async function getSentLabResults() {
	const session = await getSessionOrThrow();
	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}

	const results = await db
		.select({
			id: labResult.id,
			date: labResult.date,
			pdfFileName: labResult.pdfFileName,
			createdAt: labResult.createdAt,
			patientName: user.name,
			patientEmail: user.email,
		})
		.from(labResult)
		.innerJoin(user, eq(labResult.patientId, user.id))
		.where(isNotNull(labResult.pdfFileName))
		.orderBy(desc(labResult.createdAt));

	return results;
}

export async function deleteSentLabResult(id: string) {
	const session = await getSessionOrThrow();
	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}

	const [record] = await db
		.select({ pdfFileName: labResult.pdfFileName })
		.from(labResult)
		.where(eq(labResult.id, id));

	await db.delete(labResult).where(eq(labResult.id, id));

	if (record?.pdfFileName) {
		await supabaseAdmin.storage
			.from("lab-results")
			.remove([record.pdfFileName]);
	}

	revalidatePath("/send-lab-results");
	revalidatePath("/lab-results");
	return { success: true };
}
