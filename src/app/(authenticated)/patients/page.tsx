"use client";
import { RoleGuard } from "@/components/role-guard";
import { Patients } from "@/features/patients";

export default function PatientsPage() {
	return (
		<RoleGuard allowedRoles={["medic"]}>
			<Patients />
		</RoleGuard>
	);
}
