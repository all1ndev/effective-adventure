"use server";

import { db } from "@/db";
import { notificationQueue } from "@/db/notification-queue-schema";

interface QueueRemindersParams {
	userIds: string[];
	eventTitle: string;
	scheduledAt: Date;
	sourceType: string;
	sourceId?: string;
}

export async function queueReminders({
	userIds,
	eventTitle,
	scheduledAt,
	sourceType,
	sourceId,
}: QueueRemindersParams) {
	const now = new Date();
	const msUntilEvent = scheduledAt.getTime() - now.getTime();

	const ONE_HOUR = 60 * 60 * 1000;
	const TWELVE_HOURS = 12 * ONE_HOUR;
	const ONE_DAY = 24 * ONE_HOUR;

	const reminderOffsets: { offset: number; label: string }[] = [];

	if (msUntilEvent > ONE_DAY) {
		reminderOffsets.push({ offset: ONE_DAY, label: "mâine" });
		reminderOffsets.push({ offset: TWELVE_HOURS, label: "în 12 ore" });
		reminderOffsets.push({ offset: ONE_HOUR, label: "într-o oră" });
	} else if (msUntilEvent > TWELVE_HOURS) {
		reminderOffsets.push({ offset: TWELVE_HOURS, label: "în 12 ore" });
		reminderOffsets.push({ offset: ONE_HOUR, label: "într-o oră" });
	} else if (msUntilEvent > ONE_HOUR) {
		reminderOffsets.push({ offset: ONE_HOUR, label: "într-o oră" });
	} else {
		reminderOffsets.push({ offset: 0, label: "acum" });
	}

	const values = [];

	for (const userId of userIds) {
		for (const { offset, label } of reminderOffsets) {
			const scheduledFor = new Date(scheduledAt.getTime() - offset);
			if (scheduledFor <= now) continue;

			values.push({
				id: crypto.randomUUID(),
				userId,
				title: `Reminder: ${eventTitle}`,
				body: `Evenimentul "${eventTitle}" este programat ${label}.`,
				scheduledFor,
				sourceType,
				sourceId: sourceId ?? null,
			});
		}
	}

	if (values.length > 0) {
		await db.insert(notificationQueue).values(values);
	}
}
