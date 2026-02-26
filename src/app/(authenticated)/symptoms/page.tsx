"use client";
import { RoleGuard } from "@/components/role-guard";
import { Symptoms } from "@/features/symptoms";

export default function SymptomsPage() {
	return (
		<RoleGuard allowedRoles={["pacient"]}>
			<Symptoms />
		</RoleGuard>
	);
}
