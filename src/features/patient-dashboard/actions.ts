"use server";

import { eq } from "drizzle-orm";
import { getSessionOrThrow } from "@/lib/auth-utils";
import { db } from "@/db";
import { medication } from "@/db/medication-schema";
import { conversation } from "@/db/messaging-schema";
import { patient } from "@/db/patient-schema";
import { doctor } from "@/db/doctor-schema";
import { user } from "@/db/auth-schema";
import { vitalSign } from "@/db/vital-signs-schema";
import { desc } from "drizzle-orm";

export async function getPatientDashboardData() {
	const session = await getSessionOrThrow();
	const userId = session.user.id;

	// Latest vital sign
	const vitals = await db
		.select()
		.from(vitalSign)
		.where(eq(vitalSign.patientId, userId))
		.orderBy(desc(vitalSign.date))
		.limit(1);

	const latestVital = vitals.length > 0 ? vitals[0] : null;

	// Active medications count
	const meds = await db
		.select()
		.from(medication)
		.where(eq(medication.patientId, userId));

	const activeMeds = meds.filter((m) => {
		if (!m.endDate) return true;
		return new Date(m.endDate) >= new Date();
	});

	// Unread messages from conversations
	const convs = await db
		.select()
		.from(conversation)
		.where(eq(conversation.patientId, userId));

	const unreadMessages = convs.reduce(
		(sum, c) => sum + (c.unreadCount ?? 0),
		0,
	);

	// Doctor name and phone
	let doctorName = "";
	let doctorPhone: string | null = null;
	const patientRecord = await db
		.select({ doctorId: patient.doctorId })
		.from(patient)
		.where(eq(patient.userId, userId))
		.limit(1);

	if (patientRecord.length > 0 && patientRecord[0].doctorId) {
		const doctorUser = await db
			.select({ name: user.name })
			.from(user)
			.where(eq(user.id, patientRecord[0].doctorId))
			.limit(1);
		if (doctorUser.length > 0) {
			doctorName = doctorUser[0].name;
		}
		const doctorRecord = await db
			.select({ phone: doctor.phone })
			.from(doctor)
			.where(eq(doctor.userId, patientRecord[0].doctorId))
			.limit(1);
		if (doctorRecord.length > 0) {
			doctorPhone = doctorRecord[0].phone;
		}
	}

	return {
		latestVital: latestVital
			? {
					systolic: latestVital.systolic,
					diastolic: latestVital.diastolic,
					date: latestVital.date,
				}
			: null,
		activeMedsCount: activeMeds.length,
		unreadMessages,
		doctorName,
		doctorPhone,
	};
}
