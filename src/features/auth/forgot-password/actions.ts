"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function requestPasswordReset(email: string) {
	try {
		await auth.api.requestPasswordReset({
			body: {
				email,
				redirectTo: "/reset-password",
			},
			headers: await headers(),
		});

		return { success: true as const };
	} catch {
		return {
			success: false as const,
			error: "A apărut o eroare. Încercați din nou.",
		};
	}
}
