"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Suspense } from "react";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { auth } = useAuthStore();

	useEffect(() => {
		if (auth.accessToken) {
			router.replace("/");
		}
	}, [auth.accessToken, router]);

	if (auth.accessToken) return null;

	return <Suspense>{children}</Suspense>;
}
