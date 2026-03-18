"use client";
import { RoleGuard } from "@/components/role-guard";
import { Medication } from "@/features/medication";

export default function MedicationPage() {
	return (
		<RoleGuard allowedRoles={["user"]}>
			<Medication />
		</RoleGuard>
	);
}
