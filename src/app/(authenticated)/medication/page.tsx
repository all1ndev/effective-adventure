"use client";
import { RoleGuard } from "@/components/role-guard";
import { PreTransplantGuard } from "@/components/pre-transplant-guard";
import { Medication } from "@/features/medication";

export default function MedicationPage() {
	return (
		<RoleGuard allowedRoles={["user"]}>
			<PreTransplantGuard>
				<Medication />
			</PreTransplantGuard>
		</RoleGuard>
	);
}
