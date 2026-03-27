import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, json, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export type TestValue = {
	name: string;
	value: number;
	unit: string;
	refMin: number;
	refMax: number;
};

export const labResult = pgTable(
	"lab_result",
	{
		id: text("id").primaryKey(),
		patientId: text("patient_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		date: text("date").notNull(),
		tests: json("tests").$type<TestValue[]>().notNull(),
		pdfFileName: text("pdf_file_name"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("lab_result_patientId_idx").on(table.patientId),
		index("lab_result_date_idx").on(table.date),
	],
);

export const labResultRelations = relations(labResult, ({ one }) => ({
	patient: one(user, {
		fields: [labResult.patientId],
		references: [user.id],
	}),
}));
