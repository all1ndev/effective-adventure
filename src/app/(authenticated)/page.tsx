"use client";
import { useAuthStore } from "@/stores/auth-store";
import { Dashboard } from "@/features/dashboard";
import { RoleSelection } from "@/features/auth/role-selection";

export default function Page() {
	const accessToken = useAuthStore((s) => s.auth.accessToken);
	if (!accessToken) return <RoleSelection />;
	return <Dashboard />;
}
