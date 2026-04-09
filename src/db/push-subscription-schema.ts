import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const pushSubscription = pgTable(
	"push_subscription",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		endpoint: text("endpoint").notNull(),
		p256dh: text("p256dh").notNull(),
		auth: text("auth").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("push_subscription_userId_idx").on(table.userId)],
);

export const pushSubscriptionRelations = relations(
	pushSubscription,
	({ one }) => ({
		user: one(user, {
			fields: [pushSubscription.userId],
			references: [user.id],
		}),
	}),
);
