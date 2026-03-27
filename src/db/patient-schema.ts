import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const sexEnum = pgEnum("sex", ["masculin", "feminin", "nespecificat"]);

export const etiologyEnum = pgEnum("etiology", [
	"HBV",
	"HDV",
	"HCV",
	"MASLD",
	"alcool",
	"autoimuna",
	"altele",
]);

export const patientStatusEnum = pgEnum("patient_status", ["activ", "inactiv"]);

export const patient = pgTable(
	"patient",
	{
		id: text("id").primaryKey(),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		patientPhone: text("patient_phone"),
		sex: sexEnum("sex").notNull(),
		age: integer("age"),
		etiology: etiologyEnum("etiology"),
		transplantDate: text("transplant_date"),
		status: patientStatusEnum("status").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [index("patient_status_idx").on(table.status)],
);

export const patientRelations = relations(patient, () => ({}));
