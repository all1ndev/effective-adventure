"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { DirectionProvider } from "@/context/direction-provider";
import { ThemeProvider } from "@/context/theme-provider";
import { useAuthStore } from "@/stores/auth-store";

import { Suspense } from "react";

export default function AuthenticatedRootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const router = useRouter();
	const pathname = usePathname();
	const { auth } = useAuthStore();

	useEffect(() => {
		if (!auth.accessToken) {
			const params = new URLSearchParams({ redirect: pathname });
			router.replace(`/sign-in?${params.toString()}`);
		}
	}, [auth.accessToken, router, pathname]);

	if (!auth.accessToken) return null;

	return (
		<Suspense>
			<ThemeProvider>
				<DirectionProvider>
					<AuthenticatedLayout>{children}</AuthenticatedLayout>
				</DirectionProvider>
			</ThemeProvider>
		</Suspense>
	);
}
