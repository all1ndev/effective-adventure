"use server";

import { eq, desc, asc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSessionOrThrow } from "@/lib/auth-utils";
import { db } from "@/db";
import { conversation, message } from "@/db/messaging-schema";
import { patient } from "@/db/patient-schema";
import { doctor } from "@/db/doctor-schema";
import { user } from "@/db/auth-schema";
import { logAudit } from "@/lib/audit";

export async function getCurrentUser() {
	const session = await getSessionOrThrow();
	return {
		id: session.user.id,
		name: session.user.name,
		role: session.user.role,
	};
}

export async function getConversations() {
	const session = await getSessionOrThrow();

	if (session.user.role === "admin" || session.user.role === "doctor") {
		// Admin sees ALL conversations, doctor sees only their patients'
		let convs;
		if (session.user.role === "admin") {
			convs = await db
				.select()
				.from(conversation)
				.orderBy(desc(conversation.lastMessageAt));
		} else {
			const doctorPatients = await db
				.select({ userId: patient.userId })
				.from(patient)
				.where(eq(patient.doctorId, session.user.id));

			const patientUserIds = doctorPatients
				.map((p) => p.userId)
				.filter((id): id is string => id !== null);

			if (patientUserIds.length === 0) return [];

			convs = await db
				.select()
				.from(conversation)
				.where(inArray(conversation.patientId, patientUserIds))
				.orderBy(desc(conversation.lastMessageAt));
		}

		// Enrich with doctor name for each conversation
		const patientIds = convs.map((c) => c.patientId);
		const patientRecords =
			patientIds.length > 0
				? await db
						.select({
							userId: patient.userId,
							doctorId: patient.doctorId,
							patientPhone: patient.patientPhone,
						})
						.from(patient)
						.where(inArray(patient.userId, patientIds))
				: [];

		const doctorIds = [
			...new Set(
				patientRecords
					.map((p) => p.doctorId)
					.filter((id): id is string => id !== null),
			),
		];
		const doctorUsers =
			doctorIds.length > 0
				? await db
						.select({ id: user.id, name: user.name })
						.from(user)
						.where(inArray(user.id, doctorIds))
				: [];

		const doctorNameMap = new Map(doctorUsers.map((d) => [d.id, d.name]));
		const patientDoctorMap = new Map(
			patientRecords.map((p) => [p.userId, p.doctorId]),
		);
		const patientPhoneMap = new Map(
			patientRecords.map((p) => [p.userId, p.patientPhone]),
		);

		return convs.map((c) => {
			const doctorId = patientDoctorMap.get(c.patientId);
			const doctorName = doctorId ? (doctorNameMap.get(doctorId) ?? "—") : "—";
			const phone = patientPhoneMap.get(c.patientId) ?? null;
			return { ...c, doctorName, phone };
		});
	}

	// Patient sees only their own conversation, but display doctor name
	const patientRecord = await db
		.select({ doctorId: patient.doctorId })
		.from(patient)
		.where(eq(patient.userId, session.user.id))
		.limit(1);

	let doctorName = "Medic";
	let doctorPhone: string | null = null;
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

	const convs = await db
		.select()
		.from(conversation)
		.where(eq(conversation.patientId, session.user.id))
		.orderBy(desc(conversation.lastMessageAt));

	// Replace patientName with doctor name for patient view
	return convs.map((c) => ({
		...c,
		patientName: doctorName,
		doctorName: undefined as string | undefined,
		phone: doctorPhone,
	}));
}

export async function getMessages(conversationId: string) {
	await getSessionOrThrow();
	return db
		.select()
		.from(message)
		.where(eq(message.conversationId, conversationId))
		.orderBy(asc(message.sentAt));
}

export async function sendMessage(conversationId: string, body: string) {
	const session = await getSessionOrThrow();

	let senderName = session.user.name;

	// Admin sends as the responsible doctor
	if (session.user.role === "admin") {
		const conv = await db
			.select({ patientId: conversation.patientId })
			.from(conversation)
			.where(eq(conversation.id, conversationId))
			.limit(1);

		if (conv.length > 0) {
			const patientRecord = await db
				.select({ doctorId: patient.doctorId })
				.from(patient)
				.where(eq(patient.userId, conv[0].patientId))
				.limit(1);

			if (patientRecord.length > 0 && patientRecord[0].doctorId) {
				const doctor = await db
					.select({ name: user.name })
					.from(user)
					.where(eq(user.id, patientRecord[0].doctorId))
					.limit(1);

				if (doctor.length > 0) {
					senderName = doctor[0].name;
				}
			}
		}
	}

	const newMsg = {
		id: crypto.randomUUID(),
		conversationId,
		senderId: session.user.id,
		senderName,
		body,
		read: true,
	};
	await db.insert(message).values(newMsg);
	await db
		.update(conversation)
		.set({
			lastMessage: body,
			lastMessageAt: new Date(),
		})
		.where(eq(conversation.id, conversationId));
	await logAudit({
		userId: session.user.id,
		userName: session.user.name,
		userRole: session.user.role,
		action: "create",
		entity: "message",
		entityId: conversationId,
		description: `A trimis un mesaj`,
	});

	revalidatePath("/messaging");
	return { success: true, message: newMsg };
}
