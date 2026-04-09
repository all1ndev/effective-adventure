"use server";

import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSessionOrThrow } from "@/lib/auth-utils";
import { db } from "@/db";
import { journalEntry } from "@/db/journal-schema";
import { patient } from "@/db/patient-schema";
import { journalEntryFormSchema } from "./data/schema";
import { logAudit } from "@/lib/audit";
import { sendPushToUser } from "@/lib/push";

const moodLabels: Record<string, string> = {
	"rau": "Rău",
	"foarte-rau": "Foarte rău",
};

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

	if (parsed.data.mood === "rau" || parsed.data.mood === "foarte-rau") {
		const rows = await db
			.select({
				firstName: patient.firstName,
				lastName: patient.lastName,
				doctorId: patient.doctorId,
			})
			.from(patient)
			.where(eq(patient.userId, session.user.id))
			.limit(1);

		if (rows.length > 0 && rows[0].doctorId) {
			const patientName = `${rows[0].firstName} ${rows[0].lastName}`;
			const label = moodLabels[parsed.data.mood];
			const severity = parsed.data.mood === "foarte-rau" ? "CRITIC" : "Atenție";
			await sendPushToUser(rows[0].doctorId, {
				title: `[${severity}] Jurnal — ${patientName}`,
				body: `Pacientul a raportat starea „${label}" în jurnalul de sănătate.`,
			});
		}
	}

	await logAudit({
		userId: session.user.id,
		userName: session.user.name,
		userRole: session.user.role,
		action: "create",
		entity: "journal_entry",
		description: `A adăugat o intrare în jurnal`,
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
	await logAudit({
		userId: session.user.id,
		userName: session.user.name,
		userRole: session.user.role,
		action: "update",
		entity: "journal_entry",
		entityId: id,
		description: `A actualizat o intrare în jurnal`,
	});
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
	await logAudit({
		userId: session.user.id,
		userName: session.user.name,
		userRole: session.user.role,
		action: "delete",
		entity: "journal_entry",
		entityId: id,
		description: `A șters o intrare din jurnal`,
	});
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
