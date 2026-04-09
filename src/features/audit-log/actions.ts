"use server";

import { desc, eq, and, gte, lte, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { auditLog } from "@/db/audit-log-schema";
import { getSessionOrThrow } from "@/lib/auth-utils";

export async function getAuditLogs(filters?: {
	entity?: string;
	action?: string;
	userId?: string;
	from?: string;
	to?: string;
}) {
	const session = await getSessionOrThrow();

	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	const conditions: SQL[] = [];

	if (filters?.entity) {
		conditions.push(
			eq(
				auditLog.entity,
				filters.entity as (typeof auditLog.entity.enumValues)[number],
			),
		);
	}
	if (filters?.action) {
		conditions.push(
			eq(
				auditLog.action,
				filters.action as (typeof auditLog.action.enumValues)[number],
			),
		);
	}
	if (filters?.userId) {
		conditions.push(eq(auditLog.userId, filters.userId));
	}
	if (filters?.from) {
		conditions.push(gte(auditLog.createdAt, new Date(filters.from)));
	}
	if (filters?.to) {
		const toDate = new Date(filters.to);
		toDate.setHours(23, 59, 59, 999);
		conditions.push(lte(auditLog.createdAt, toDate));
	}

	return db
		.select()
		.from(auditLog)
		.where(conditions.length > 0 ? and(...conditions) : undefined)
		.orderBy(desc(auditLog.createdAt))
		.limit(500);
}
