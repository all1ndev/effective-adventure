"use client";
import { RoleGuard } from "@/components/role-guard";
import { Education } from "@/features/education";

export default function EducationPage() {
	return (
		<RoleGuard allowedRoles={["pacient"]}>
			<Education />
		</RoleGuard>
	);
}
