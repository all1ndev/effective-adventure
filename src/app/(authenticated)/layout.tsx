"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { DirectionProvider } from "@/context/direction-provider";
import { ThemeProvider } from "@/context/theme-provider";
import { useSession } from "@/lib/auth-client";

import { Suspense } from "react";

export default function AuthenticatedRootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const router = useRouter();
	const pathname = usePathname();
	const { data: session, isPending } = useSession();

	useEffect(() => {
		if (!isPending && !session) {
			const params = new URLSearchParams({ redirect: pathname });
			router.replace(`/sign-in?${params.toString()}`);
		}
	}, [session, isPending, router, pathname]);

	if (isPending || !session) return null;

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
