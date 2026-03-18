"use client";
import { RoleGuard } from "@/components/role-guard";
import { VitalSigns } from "@/features/vital-signs";

export default function VitalSignsPage() {
	return (
		<RoleGuard allowedRoles={["user"]}>
			<VitalSigns />
		</RoleGuard>
	);
}
