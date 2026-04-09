"use client";
import { RoleGuard } from "@/components/role-guard";
import { AuditLog } from "@/features/audit-log";

export default function AuditLogPage() {
	return (
		<RoleGuard allowedRoles={["admin"]}>
			<AuditLog />
		</RoleGuard>
	);
}
