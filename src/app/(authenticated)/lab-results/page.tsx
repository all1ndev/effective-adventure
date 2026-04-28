"use client";
import { RoleGuard } from "@/components/role-guard";
import { PreTransplantGuard } from "@/components/pre-transplant-guard";
import { LabResults } from "@/features/lab-results";

export default function LabResultsPage() {
	return (
		<RoleGuard allowedRoles={["user"]}>
			<PreTransplantGuard>
				<LabResults />
			</PreTransplantGuard>
		</RoleGuard>
	);
}
