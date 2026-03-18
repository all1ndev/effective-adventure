"use client";
import { RoleGuard } from "@/components/role-guard";
import { DoctorPatients } from "@/features/add-patient";

export default function DoctorPage() {
	return (
		<RoleGuard allowedRoles={["admin"]}>
			<DoctorPatients />
		</RoleGuard>
	);
}
