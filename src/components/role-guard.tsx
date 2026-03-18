"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AppRole } from "@/lib/roles";

interface RoleGuardProps {
	allowedRoles: AppRole[];
	children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
	const router = useRouter();
	// TODO: implement role system with better-auth
	const role: AppRole = "pacient";
	const authorized = allowedRoles.includes(role);

	useEffect(() => {
		if (!authorized) {
			router.replace("/errors/forbidden");
		}
	}, [authorized, router]);

	if (!authorized) return null;
	return <>{children}</>;
}
