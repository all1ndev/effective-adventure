import { relations } from "drizzle-orm";
import { pgTable, pgEnum, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const notificationTargetEnum = pgEnum("notification_target", [
	"patient",
	"group",
	"medication",
	"category",
	"compliance",
	"all",
	"doctor",
	"etiology",
]);

export const notificationSeverityEnum = pgEnum("notification_severity", [
	"critical",
	"warning",
	"info",
]);

export const notification = pgTable(
	"notification",
	{
		id: text("id").primaryKey(),
		title: text("title").notNull(),
		message: text("message").notNull(),
		severity: notificationSeverityEnum("severity").default("info").notNull(),
		targetType: notificationTargetEnum("target_type").notNull(),
		targetValue: text("target_value"),
		createdBy: text("created_by")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdByName: text("created_by_name").notNull(),
		scheduledAt: timestamp("scheduled_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("notification_createdAt_idx").on(table.createdAt)],
);

export const notificationRead = pgTable(
	"notification_read",
	{
		id: text("id").primaryKey(),
		notificationId: text("notification_id")
			.notNull()
			.references(() => notification.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		readAt: timestamp("read_at").defaultNow().notNull(),
	},
	(table) => [
		index("notificationRead_notificationId_idx").on(table.notificationId),
		index("notificationRead_userId_idx").on(table.userId),
	],
);

export const notificationRelations = relations(
	notification,
	({ one, many }) => ({
		createdByUser: one(user, {
			fields: [notification.createdBy],
			references: [user.id],
		}),
		reads: many(notificationRead),
	}),
);

export const notificationReadRelations = relations(
	notificationRead,
	({ one }) => ({
		notification: one(notification, {
			fields: [notificationRead.notificationId],
			references: [notification.id],
		}),
		user: one(user, {
			fields: [notificationRead.userId],
			references: [user.id],
		}),
	}),
);
