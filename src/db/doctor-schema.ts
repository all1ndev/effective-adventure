import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const doctorStatusEnum = pgEnum("doctor_status", ["activ", "inactiv"]);

export const doctor = pgTable(
	"doctor",
	{
		id: text("id").primaryKey(),
		userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		specialization: text("specialization"),
		phone: text("phone"),
		licenseNumber: text("license_number"),
		status: doctorStatusEnum("status").notNull().default("activ"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		index("doctor_user_id_idx").on(table.userId),
		index("doctor_status_idx").on(table.status),
	],
);

export const doctorRelations = relations(doctor, ({ one }) => ({
	user: one(user, {
		fields: [doctor.userId],
		references: [user.id],
	}),
}));
