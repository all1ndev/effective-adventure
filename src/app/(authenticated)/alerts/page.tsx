"use client";
import { RoleGuard } from "@/components/role-guard";
import { Alerts } from "@/features/alerts";

export default function AlertsPage() {
	return (
		<RoleGuard allowedRoles={["medic"]}>
			<Alerts />
		</RoleGuard>
	);
}
