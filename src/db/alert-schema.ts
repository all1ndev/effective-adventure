import { relations } from "drizzle-orm";
import {
	pgTable,
	text,
	timestamp,
	boolean,
	index,
	pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const alertTypeEnum = pgEnum("alert_type", [
	"vital",
	"simptom",
	"laborator",
	"medicatie",
]);

export const alertSeverityEnum = pgEnum("alert_severity", [
	"critical",
	"warning",
	"info",
]);

export const alert = pgTable(
	"alert",
	{
		id: text("id").primaryKey(),
		patientId: text("patient_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		patientName: text("patient_name").notNull(),
		type: alertTypeEnum("type").notNull(),
		severity: alertSeverityEnum("severity").notNull(),
		message: text("message").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		dismissed: boolean("dismissed").default(false).notNull(),
	},
	(table) => [
		index("alert_patientId_idx").on(table.patientId),
		index("alert_severity_idx").on(table.severity),
	],
);

export const alertRelations = relations(alert, ({ one }) => ({
	patient: one(user, {
		fields: [alert.patientId],
		references: [user.id],
	}),
}));
