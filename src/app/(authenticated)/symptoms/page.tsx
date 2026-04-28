"use client";
import { RoleGuard } from "@/components/role-guard";
import { PreTransplantGuard } from "@/components/pre-transplant-guard";
import { Symptoms } from "@/features/symptoms";

export default function SymptomsPage() {
	return (
		<RoleGuard allowedRoles={["user"]}>
			<PreTransplantGuard>
				<Symptoms />
			</PreTransplantGuard>
		</RoleGuard>
	);
}
