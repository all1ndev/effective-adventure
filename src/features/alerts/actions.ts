"use server";

import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { alert } from "@/db/alert-schema";

async function getSessionOrThrow() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		throw new Error("Neautorizat");
	}
	return session;
}

export async function getAlerts() {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}
	return db.select().from(alert).orderBy(desc(alert.createdAt));
}

export async function dismissAlert(id: string) {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}
	await db.update(alert).set({ dismissed: true }).where(eq(alert.id, id));
	revalidatePath("/alerts");
	return { success: true };
}
