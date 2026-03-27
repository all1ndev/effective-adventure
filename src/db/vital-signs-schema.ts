import { relations } from "drizzle-orm";
import {
	pgTable,
	pgEnum,
	text,
	timestamp,
	integer,
	real,
	index,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const vitalStatusEnum = pgEnum("vital_status", [
	"normal",
	"warning",
	"critical",
]);

export const vitalSign = pgTable(
	"vital_sign",
	{
		id: text("id").primaryKey(),
		patientId: text("patient_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		date: text("date").notNull(),
		systolic: integer("systolic").notNull(),
		diastolic: integer("diastolic").notNull(),
		temperature: real("temperature").notNull(),
		pulse: integer("pulse").notNull(),
		weight: real("weight").notNull(),
		status: vitalStatusEnum("status").notNull().default("normal"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("vital_sign_patientId_idx").on(table.patientId),
		index("vital_sign_date_idx").on(table.date),
	],
);

export const vitalSignRelations = relations(vitalSign, ({ one }) => ({
	patient: one(user, {
		fields: [vitalSign.patientId],
		references: [user.id],
	}),
}));
