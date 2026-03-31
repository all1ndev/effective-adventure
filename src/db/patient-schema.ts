import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	json,
	pgEnum,
	pgTable,
	real,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

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

export const donorTypeEnum = pgEnum("donor_type", ["cadaveric", "viu"]);

export const donorStatusEnum = pgEnum("donor_status", [
	"pozitiv",
	"negativ",
	"necunoscut",
]);

export const rejectionTypeEnum = pgEnum("rejection_type", ["acut", "cronic"]);

export const hbIgRouteEnum = pgEnum("hb_ig_route", ["iv", "sc"]);

export const languageEnum = pgEnum("preferred_language", [
	"ro",
	"en",
	"it",
	"fr",
	"de",
]);

export const patient = pgTable(
	"patient",
	{
		id: text("id").primaryKey(),
		userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
		doctorId: text("doctor_id").references(() => user.id, {
			onDelete: "set null",
		}),
		patientCode: text("patient_code").notNull(),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		patientPhone: text("patient_phone"),
		sex: sexEnum("sex").notNull(),
		age: integer("age"),
		weightKg: real("weight_kg"),
		heightCm: real("height_cm"),
		bmi: real("bmi"),
		nationality: text("nationality"),
		preferredLanguage: languageEnum("preferred_language").default("ro"),
		etiology: etiologyEnum("etiology"),
		etiologyOther: text("etiology_other"),
		transplantDate: text("transplant_date"),
		donorType: donorTypeEnum("donor_type"),
		donorAntiHbc: donorStatusEnum("donor_anti_hbc"),
		donorHbsAg: donorStatusEnum("donor_hbs_ag"),
		rejectionHistory: boolean("rejection_history").default(false),
		rejectionDate: text("rejection_date"),
		rejectionType: rejectionTypeEnum("rejection_type"),
		majorComplications: text("major_complications"),
		immunosuppressants: json("immunosuppressants")
			.$type<string[]>()
			.default([]),
		antiviralProphylaxis: json("antiviral_prophylaxis")
			.$type<string[]>()
			.default([]),
		hbIg: boolean("hb_ig").default(false),
		hbIgRoute: hbIgRouteEnum("hb_ig_route"),
		hbIgFrequency: text("hb_ig_frequency"),
		otherMeds: text("other_meds"),
		status: patientStatusEnum("status").notNull().default("activ"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		index("patient_status_idx").on(table.status),
		index("patient_user_id_idx").on(table.userId),
		index("patient_doctor_id_idx").on(table.doctorId),
	],
);

export const patientRelations = relations(patient, ({ one }) => ({
	user: one(user, {
		fields: [patient.userId],
		references: [user.id],
	}),
	doctor: one(user, {
		fields: [patient.doctorId],
		references: [user.id],
	}),
}));
