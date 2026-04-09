import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const notificationQueue = pgTable(
	"notification_queue",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		body: text("body").notNull(),
		scheduledFor: timestamp("scheduled_for").notNull(),
		sent: boolean("sent").default(false).notNull(),
		sourceType: text("source_type").notNull(),
		sourceId: text("source_id"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("notification_queue_scheduledFor_idx").on(table.scheduledFor),
		index("notification_queue_userId_idx").on(table.userId),
		index("notification_queue_sent_idx").on(table.sent),
	],
);

export const notificationQueueRelations = relations(
	notificationQueue,
	({ one }) => ({
		user: one(user, {
			fields: [notificationQueue.userId],
			references: [user.id],
		}),
	}),
);
