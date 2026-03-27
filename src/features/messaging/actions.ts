"use server";

import { eq, desc, asc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { conversation, message } from "@/db/messaging-schema";
import { patient } from "@/db/patient-schema";
import { user } from "@/db/auth-schema";

async function getSessionOrThrow() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		throw new Error("Neautorizat");
	}
	return session;
}

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

	if (session.user.role === "admin") {
		// Doctor sees conversations for their patients
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
			.from(conversation)
			.where(inArray(conversation.patientId, patientUserIds))
			.orderBy(desc(conversation.lastMessageAt));
	}

	// Patient sees only their own conversation, but display doctor name
	const patientRecord = await db
		.select({ doctorId: patient.doctorId })
		.from(patient)
		.where(eq(patient.userId, session.user.id))
		.limit(1);

	let doctorName = "Medic";
	if (patientRecord.length > 0 && patientRecord[0].doctorId) {
		const doctor = await db
			.select({ name: user.name })
			.from(user)
			.where(eq(user.id, patientRecord[0].doctorId))
			.limit(1);
		if (doctor.length > 0) {
			doctorName = doctor[0].name;
		}
	}

	const convs = await db
		.select()
		.from(conversation)
		.where(eq(conversation.patientId, session.user.id))
		.orderBy(desc(conversation.lastMessageAt));

	// Replace patientName with doctor name for patient view
	return convs.map((c) => ({ ...c, patientName: doctorName }));
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
	const newMsg = {
		id: crypto.randomUUID(),
		conversationId,
		senderId: session.user.id,
		senderName: session.user.name,
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
	revalidatePath("/messaging");
	return { success: true, message: newMsg };
}
