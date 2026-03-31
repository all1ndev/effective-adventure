"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { data: session, isPending } = useSession();

	useEffect(() => {
		if (session) {
			router.replace("/");
		}
	}, [session, router]);

	if (isPending) return null;
	if (session) return null;

	return (
		<Suspense>
			{children}
			<Toaster richColors closeButton />
		</Suspense>
	);
}
