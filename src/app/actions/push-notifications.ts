"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscription } from "@/db/push-subscription-schema";
import { getSessionOrThrow } from "@/lib/auth-utils";

interface PushSubscriptionData {
	endpoint: string;
	keys: { p256dh: string; auth: string };
}

export async function subscribeUser(sub: PushSubscriptionData) {
	const session = await getSessionOrThrow();

	const existing = await db
		.select()
		.from(pushSubscription)
		.where(
			and(
				eq(pushSubscription.userId, session.user.id),
				eq(pushSubscription.endpoint, sub.endpoint),
			),
		)
		.limit(1);

	if (existing.length > 0) {
		return { success: true };
	}

	await db.insert(pushSubscription).values({
		id: crypto.randomUUID(),
		userId: session.user.id,
		endpoint: sub.endpoint,
		p256dh: sub.keys.p256dh,
		auth: sub.keys.auth,
	});

	return { success: true };
}

export async function unsubscribeUser() {
	const session = await getSessionOrThrow();

	await db
		.delete(pushSubscription)
		.where(eq(pushSubscription.userId, session.user.id));

	return { success: true };
}

export async function sendNotification(message: string) {
	const session = await getSessionOrThrow();
	const { sendPushToUser } = await import("@/lib/push");

	await sendPushToUser(session.user.id, {
		title: "Transplant Care",
		body: message,
	});

	return { success: true };
}
