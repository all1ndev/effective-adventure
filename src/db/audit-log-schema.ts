import {
	pgTable,
	pgEnum,
	text,
	timestamp,
	index,
	jsonb,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const auditActionEnum = pgEnum("audit_action", [
	"create",
	"update",
	"delete",
]);

export const auditEntityEnum = pgEnum("audit_entity", [
	"patient",
	"doctor",
	"medication",
	"medication_log",
	"vital_sign",
	"symptom_report",
	"lab_result",
	"clinical_note",
	"alert",
	"notification",
	"message",
	"journal_entry",
	"appointment",
]);

export const auditLog = pgTable(
	"audit_log",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		userName: text("user_name").notNull(),
		userRole: text("user_role").notNull(),
		action: auditActionEnum("action").notNull(),
		entity: auditEntityEnum("entity").notNull(),
		entityId: text("entity_id"),
		description: text("description").notNull(),
		metadata: jsonb("metadata"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("audit_log_userId_idx").on(table.userId),
		index("audit_log_entity_idx").on(table.entity),
		index("audit_log_action_idx").on(table.action),
		index("audit_log_createdAt_idx").on(table.createdAt),
	],
);
