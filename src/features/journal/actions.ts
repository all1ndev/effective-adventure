"use server";

import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { journalEntry } from "@/db/journal-schema";
import { journalEntryFormSchema } from "./data/schema";

async function getSessionOrThrow() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		throw new Error("Neautorizat");
	}
	return session;
}

export async function createJournalEntry(values: unknown) {
	const session = await getSessionOrThrow();
	const parsed = journalEntryFormSchema.safeParse(values);
	if (!parsed.success) {
		return { error: "Date invalide." };
	}
	const today = new Date().toISOString().split("T")[0];
	await db.insert(journalEntry).values({
		id: crypto.randomUUID(),
		userId: session.user.id,
		date: today,
		...parsed.data,
	});
	revalidatePath("/journal");
	return { success: true };
}

export async function updateJournalEntry(id: string, values: unknown) {
	const session = await getSessionOrThrow();
	const parsed = journalEntryFormSchema.safeParse(values);
	if (!parsed.success) {
		return { error: "Date invalide." };
	}
	const existing = await db
		.select()
		.from(journalEntry)
		.where(
			and(eq(journalEntry.id, id), eq(journalEntry.userId, session.user.id)),
		)
		.limit(1);
	if (existing.length === 0) {
		return { error: "Inregistrarea nu a fost gasita." };
	}
	await db.update(journalEntry).set(parsed.data).where(eq(journalEntry.id, id));
	revalidatePath("/journal");
	return { success: true };
}

export async function deleteJournalEntry(id: string) {
	const session = await getSessionOrThrow();
	const existing = await db
		.select()
		.from(journalEntry)
		.where(
			and(eq(journalEntry.id, id), eq(journalEntry.userId, session.user.id)),
		)
		.limit(1);
	if (existing.length === 0) {
		return { error: "Inregistrarea nu a fost gasita." };
	}
	await db.delete(journalEntry).where(eq(journalEntry.id, id));
	revalidatePath("/journal");
	return { success: true };
}

export async function getJournalEntries() {
	const session = await getSessionOrThrow();
	return db
		.select()
		.from(journalEntry)
		.where(eq(journalEntry.userId, session.user.id))
		.orderBy(desc(journalEntry.date));
}
