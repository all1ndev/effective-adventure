import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const moodEnum = pgEnum("mood", [
	"excelent",
	"bine",
	"neutru",
	"rau",
	"foarte-rau",
]);

export const journalEntry = pgTable(
	"journal_entry",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		date: text("date").notNull(),
		mood: moodEnum("mood").notNull(),
		content: text("content").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("journal_entry_userId_idx").on(table.userId),
		index("journal_entry_date_idx").on(table.date),
	],
);

export const journalEntryRelations = relations(journalEntry, ({ one }) => ({
	user: one(user, {
		fields: [journalEntry.userId],
		references: [user.id],
	}),
}));
