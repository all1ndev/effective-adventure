"use server";

import { eq, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { conversation, message } from "@/db/messaging-schema";

async function getSessionOrThrow() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		throw new Error("Neautorizat");
	}
	return session;
}

export async function getConversations() {
	await getSessionOrThrow();
	return db
		.select()
		.from(conversation)
		.orderBy(desc(conversation.lastMessageAt));
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
