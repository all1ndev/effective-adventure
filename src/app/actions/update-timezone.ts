"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { getSessionOrThrow } from "@/lib/auth-utils";

export async function updateTimezone(timezone: string) {
	const session = await getSessionOrThrow();

	// Validate that it's a real IANA timezone
	try {
		Intl.DateTimeFormat(undefined, { timeZone: timezone });
	} catch {
		return;
	}

	await db.update(user).set({ timezone }).where(eq(user.id, session.user.id));
}
