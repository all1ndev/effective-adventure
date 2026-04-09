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
import { logAudit } from "@/lib/audit";
import { sendPushToUser } from "@/lib/push";

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

	await sendPushToUser(values.patientId, {
		title: "Rezultate de laborator noi",
		body: "Medicul dumneavoastră a încărcat rezultate de laborator noi.",
	});

	await logAudit({
		userId: session.user.id,
		userName: session.user.name,
		userRole: session.user.role,
		action: "create",
		entity: "lab_result",
		description: `A trimis rezultate de laborator (PDF) pentru pacient`,
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

	await logAudit({
		userId: session.user.id,
		userName: session.user.name,
		userRole: session.user.role,
		action: "delete",
		entity: "lab_result",
		entityId: id,
		description: `A șters un rezultat de laborator trimis`,
	});

	revalidatePath("/send-lab-results");
	revalidatePath("/lab-results");
	return { success: true };
}
