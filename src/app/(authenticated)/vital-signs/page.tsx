"use client";
import { RoleGuard } from "@/components/role-guard";
import { PreTransplantGuard } from "@/components/pre-transplant-guard";
import { VitalSigns } from "@/features/vital-signs";

export default function VitalSignsPage() {
	return (
		<RoleGuard allowedRoles={["user"]}>
			<PreTransplantGuard>
				<VitalSigns />
			</PreTransplantGuard>
		</RoleGuard>
	);
}
