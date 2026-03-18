"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getUserRole, type AppRole } from "@/lib/roles";

interface RoleGuardProps {
	allowedRoles: AppRole[];
	children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
	const router = useRouter();
	const { data: session, isPending } = useSession();
	const role = getUserRole(session?.user?.role);
	const authorized = role !== null && allowedRoles.includes(role);

	useEffect(() => {
		if (!isPending && !authorized) {
			router.replace("/errors/forbidden");
		}
	}, [isPending, authorized, router]);

	if (isPending || !authorized) return null;
	return <>{children}</>;
}
