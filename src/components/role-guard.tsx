"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { getUserRole, type AppRole } from "@/lib/roles";

interface RoleGuardProps {
	allowedRoles: AppRole[];
	children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
	const { auth } = useAuthStore();
	const router = useRouter();
	const role = getUserRole(auth.user);
	const authorized = !!role && allowedRoles.includes(role);

	useEffect(() => {
		if (!authorized) {
			router.replace("/errors/forbidden");
		}
	}, [authorized, router]);

	if (!authorized) return null;
	return <>{children}</>;
}
