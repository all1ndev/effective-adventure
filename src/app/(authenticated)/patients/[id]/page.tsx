"use client";

import { use } from "react";
import { RoleGuard } from "@/components/role-guard";
import { PatientDetail } from "@/features/patients/components/patient-detail";

export default function PatientDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	return (
		<RoleGuard allowedRoles={["admin", "doctor"]}>
			<PatientDetail patientId={id} />
		</RoleGuard>
	);
}
