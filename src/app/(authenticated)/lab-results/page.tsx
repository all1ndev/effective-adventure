"use client";
import { RoleGuard } from "@/components/role-guard";
import { LabResults } from "@/features/lab-results";

export default function LabResultsPage() {
	return (
		<RoleGuard allowedRoles={["user"]}>
			<LabResults />
		</RoleGuard>
	);
}
