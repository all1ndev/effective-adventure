import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const clinicalNote = pgTable(
	"clinical_note",
	{
		id: text("id").primaryKey(),
		patientId: text("patient_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		visitDate: text("visit_date").notNull(),
		content: text("content").notNull(),
		author: text("author").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("clinical_note_patientId_idx").on(table.patientId),
		index("clinical_note_visitDate_idx").on(table.visitDate),
	],
);

export const clinicalNoteRelations = relations(clinicalNote, ({ one }) => ({
	patient: one(user, {
		fields: [clinicalNote.patientId],
		references: [user.id],
	}),
}));
