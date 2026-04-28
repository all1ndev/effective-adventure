"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getUserRole } from "@/lib/roles";
import { useTransplantStatus } from "@/hooks/use-transplant-status";

interface PreTransplantGuardProps {
	children: React.ReactNode;
}

export function PreTransplantGuard({ children }: PreTransplantGuardProps) {
	const router = useRouter();
	const { data: session, isPending } = useSession();
	const role = getUserRole(session?.user?.role);
	const isPatient = role === "user";
	const { isPreTransplant, isLoading } = useTransplantStatus(isPatient);
	const blocked = isPatient && !isLoading && isPreTransplant;

	useEffect(() => {
		if (!isPending && blocked) {
			router.replace("/errors/forbidden");
		}
	}, [isPending, blocked, router]);

	if (isPending || (isPatient && isLoading) || blocked) return null;
	return <>{children}</>;
}
