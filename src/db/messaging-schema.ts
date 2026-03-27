import { relations } from "drizzle-orm";
import {
	pgTable,
	text,
	timestamp,
	boolean,
	integer,
	index,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const conversation = pgTable(
	"conversation",
	{
		id: text("id").primaryKey(),
		patientId: text("patient_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		patientName: text("patient_name").notNull(),
		lastMessage: text("last_message").notNull().default(""),
		lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
		unreadCount: integer("unread_count").notNull().default(0),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("conversation_patientId_idx").on(table.patientId)],
);

export const message = pgTable(
	"message",
	{
		id: text("id").primaryKey(),
		conversationId: text("conversation_id")
			.notNull()
			.references(() => conversation.id, { onDelete: "cascade" }),
		senderId: text("sender_id").notNull(),
		senderName: text("sender_name").notNull(),
		body: text("body").notNull(),
		sentAt: timestamp("sent_at").defaultNow().notNull(),
		read: boolean("read").default(false).notNull(),
	},
	(table) => [index("message_conversationId_idx").on(table.conversationId)],
);

export const conversationRelations = relations(
	conversation,
	({ one, many }) => ({
		patient: one(user, {
			fields: [conversation.patientId],
			references: [user.id],
		}),
		messages: many(message),
	}),
);

export const messageRelations = relations(message, ({ one }) => ({
	conversation: one(conversation, {
		fields: [message.conversationId],
		references: [conversation.id],
	}),
}));
