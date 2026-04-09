import { NextResponse } from "next/server";
import { lte, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { notificationQueue } from "@/db/notification-queue-schema";
import { sendPushToUser } from "@/lib/push";

export async function GET(request: Request) {
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const now = new Date();

	const pending = await db
		.select()
		.from(notificationQueue)
		.where(
			and(
				eq(notificationQueue.sent, false),
				lte(notificationQueue.scheduledFor, now),
			),
		);

	let sentCount = 0;

	for (const item of pending) {
		try {
			await sendPushToUser(item.userId, {
				title: item.title,
				body: item.body,
			});

			await db
				.update(notificationQueue)
				.set({ sent: true })
				.where(eq(notificationQueue.id, item.id));

			sentCount++;
		} catch {
			console.error(`Failed to send queued notification ${item.id}`);
		}
	}

	return NextResponse.json({ sent: sentCount, total: pending.length });
}
