"use server";

import webpush from "web-push";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscription } from "@/db/push-subscription-schema";

webpush.setVapidDetails(
	"mailto:testingemailveronica@gmail.com",
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
	process.env.VAPID_PRIVATE_KEY!,
);

async function logPush(
	userId: string,
	endpoint: string,
	title: string,
	status: string,
	error: string | null,
) {
	try {
		await db.execute(
			sql`INSERT INTO push_log (id, user_id, endpoint_prefix, title, status, error) VALUES (${crypto.randomUUID()}, ${userId}, ${endpoint.slice(0, 60)}, ${title}, ${status}, ${error})`,
		);
	} catch {
		// swallow log errors
	}
}

export async function sendPushToUser(
	userId: string,
	payload: { title: string; body: string },
) {
	const subscriptions = await db
		.select()
		.from(pushSubscription)
		.where(eq(pushSubscription.userId, userId));

	if (subscriptions.length === 0) {
		await logPush(userId, "-", payload.title, "no_subscription", null);
		return;
	}

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
			await logPush(userId, sub.endpoint, payload.title, "sent", null);
		} catch (err: unknown) {
			const statusCode =
				err && typeof err === "object" && "statusCode" in err
					? (err as { statusCode: number }).statusCode
					: null;
			const errMsg = err instanceof Error ? err.message : String(err);
			if (statusCode === 410 || statusCode === 404) {
				await db
					.delete(pushSubscription)
					.where(eq(pushSubscription.id, sub.id));
				await logPush(
					userId,
					sub.endpoint,
					payload.title,
					"deleted_stale",
					errMsg,
				);
			} else {
				await logPush(
					userId,
					sub.endpoint,
					payload.title,
					`error_${statusCode ?? "unknown"}`,
					errMsg,
				);
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
