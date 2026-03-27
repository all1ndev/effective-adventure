import { relations } from "drizzle-orm";
import {
	pgTable,
	text,
	timestamp,
	json,
	index,
	pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const severityEnum = pgEnum("severity", [
	"usoara",
	"moderata",
	"severa",
]);

export const symptomReport = pgTable(
	"symptom_report",
	{
		id: text("id").primaryKey(),
		patientId: text("patient_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		date: text("date").notNull(),
		symptoms: json("symptoms").$type<string[]>().notNull(),
		severity: severityEnum("severity").notNull(),
		notes: text("notes"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("symptom_report_patientId_idx").on(table.patientId),
		index("symptom_report_date_idx").on(table.date),
	],
);

export const symptomReportRelations = relations(symptomReport, ({ one }) => ({
	patient: one(user, {
		fields: [symptomReport.patientId],
		references: [user.id],
	}),
}));
