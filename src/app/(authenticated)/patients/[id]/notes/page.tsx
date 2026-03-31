"use client";
import { use } from "react";
import { RoleGuard } from "@/components/role-guard";
import { ClinicalNotes } from "@/features/clinical-notes";

export default function PatientNotesPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	return (
		<RoleGuard allowedRoles={["admin", "doctor"]}>
			<ClinicalNotes patientId={id} />
		</RoleGuard>
	);
}
