"use server";

import { db } from "@/db";
import { auditLog } from "@/db/audit-log-schema";

type AuditAction = "create" | "update" | "delete";

type AuditEntity =
	| "patient"
	| "doctor"
	| "medication"
	| "medication_log"
	| "vital_sign"
	| "symptom_report"
	| "lab_result"
	| "clinical_note"
	| "alert"
	| "notification"
	| "message"
	| "journal_entry"
	| "appointment"
	| "medication_reminder";

interface LogAuditParams {
	userId: string;
	userName: string | null | undefined;
	userRole: string | null | undefined;
	action: AuditAction;
	entity: AuditEntity;
	entityId?: string;
	description: string;
	metadata?: Record<string, unknown>;
}

export async function logAudit(params: LogAuditParams) {
	try {
		await db.insert(auditLog).values({
			id: crypto.randomUUID(),
			userId: params.userId,
			userName: params.userName ?? "Necunoscut",
			userRole: params.userRole ?? "user",
			action: params.action,
			entity: params.entity,
			entityId: params.entityId ?? null,
			description: params.description,
			metadata: params.metadata ?? null,
		});
	} catch {
		// Audit logging should never break the main flow
		console.error("Failed to write audit log");
	}
}
