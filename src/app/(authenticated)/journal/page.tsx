"use client";
import { RoleGuard } from "@/components/role-guard";
import { Journal } from "@/features/journal";

export default function JournalPage() {
	return (
		<RoleGuard allowedRoles={["pacient"]}>
			<Journal />
		</RoleGuard>
	);
}
