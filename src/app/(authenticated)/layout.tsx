"use client";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { DirectionProvider } from "@/context/direction-provider";
import { ThemeProvider } from "@/context/theme-provider";

import { Suspense } from "react";

export default function AuthenticatedRootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
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
