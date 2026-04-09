import { relations } from "drizzle-orm";
import {
	pgTable,
	text,
	integer,
	boolean,
	timestamp,
	index,
	unique,
} from "drizzle-orm/pg-core";
import { medication } from "./medication-schema";

export const medicationReminder = pgTable(
	"medication_reminder",
	{
		id: text("id").primaryKey(),
		medicationId: text("medication_id")
			.notNull()
			.references(() => medication.id, { onDelete: "cascade" }),
		doseIndex: integer("dose_index").notNull(),
		time: text("time").notNull(), // "HH:mm" format
		enabled: boolean("enabled").default(true).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("medication_reminder_medicationId_idx").on(table.medicationId),
		unique("medication_reminder_med_dose_uq").on(
			table.medicationId,
			table.doseIndex,
		),
	],
);

export const medicationReminderRelations = relations(
	medicationReminder,
	({ one }) => ({
		medication: one(medication, {
			fields: [medicationReminder.medicationId],
			references: [medication.id],
		}),
	}),
);
