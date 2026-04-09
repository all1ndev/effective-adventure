"use server";

import webpush from "web-push";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscription } from "@/db/push-subscription-schema";

webpush.setVapidDetails(
	"mailto:testingemailveronica@gmail.com",
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
	process.env.VAPID_PRIVATE_KEY!,
);

export async function sendPushToUser(
	userId: string,
	payload: { title: string; body: string },
) {
	const subscriptions = await db
		.select()
		.from(pushSubscription)
		.where(eq(pushSubscription.userId, userId));

	for (const sub of subscriptions) {
		try {
			await webpush.sendNotification(
				{
					endpoint: sub.endpoint,
					keys: { p256dh: sub.p256dh, auth: sub.auth },
				},
				JSON.stringify({
					title: payload.title,
					body: payload.body,
					icon: "/icon-192x192.png",
				}),
			);
		} catch (err: unknown) {
			const statusCode =
				err && typeof err === "object" && "statusCode" in err
					? (err as { statusCode: number }).statusCode
					: null;
			if (statusCode === 410 || statusCode === 404) {
				await db
					.delete(pushSubscription)
					.where(eq(pushSubscription.id, sub.id));
			} else {
				console.error(`Push failed for subscription ${sub.id}:`, err);
			}
		}
	}
}

export async function sendPushToUsers(
	userIds: string[],
	payload: { title: string; body: string },
) {
	await Promise.allSettled(
		userIds.map((userId) => sendPushToUser(userId, payload)),
	);
}
