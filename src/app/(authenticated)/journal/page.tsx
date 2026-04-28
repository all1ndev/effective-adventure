"use client";
import { RoleGuard } from "@/components/role-guard";
import { PreTransplantGuard } from "@/components/pre-transplant-guard";
import { Journal } from "@/features/journal";

export default function JournalPage() {
	return (
		<RoleGuard allowedRoles={["user"]}>
			<PreTransplantGuard>
				<Journal />
			</PreTransplantGuard>
		</RoleGuard>
	);
}
