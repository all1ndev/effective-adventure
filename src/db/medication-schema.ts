import { relations } from "drizzle-orm";
import { pgTable, pgEnum, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const medication = pgTable(
	"medication",
	{
		id: text("id").primaryKey(),
		patientId: text("patient_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		dose: text("dose").notNull(),
		frequency: text("frequency").notNull(),
		notes: text("notes"),
		startDate: text("start_date").notNull(),
		endDate: text("end_date"),
		category: text("category").default("altele").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("medication_patientId_idx").on(table.patientId)],
);

export const medicationLogStatusEnum = pgEnum("medication_log_status", [
	"luat",
	"omis",
	"intarziat",
]);

export const medicationLog = pgTable(
	"medication_log",
	{
		id: text("id").primaryKey(),
		medicationId: text("medication_id")
			.notNull()
			.references(() => medication.id, { onDelete: "cascade" }),
		takenAt: text("taken_at").notNull(),
		status: medicationLogStatusEnum("status").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("medicationLog_medicationId_idx").on(table.medicationId)],
);

export const medicationRelations = relations(medication, ({ one, many }) => ({
	patient: one(user, {
		fields: [medication.patientId],
		references: [user.id],
	}),
	logs: many(medicationLog),
}));

export const medicationLogRelations = relations(medicationLog, ({ one }) => ({
	medication: one(medication, {
		fields: [medicationLog.medicationId],
		references: [medication.id],
	}),
}));
