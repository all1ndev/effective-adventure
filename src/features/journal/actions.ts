"use server";

import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSessionOrThrow } from "@/lib/auth-utils";
import { db } from "@/db";
import { journalEntry } from "@/db/journal-schema";
import { patient } from "@/db/patient-schema";
import { assertPatientNotPreTransplant } from "@/lib/patient-utils";
import { journalEntryFormSchema } from "./data/schema";
import { logAudit } from "@/lib/audit";
import { sendPushToUser } from "@/lib/push";

const moodLabels: Record<string, string> = {
	"rau": "Rău",
	"foarte-rau": "Foarte rău",
};

async function notifyDoctorOfBadMood(patientUserId: string, mood: string) {
	if (mood !== "rau" && mood !== "foarte-rau") return;

	const rows = await db
		.select({
			firstName: patient.firstName,
			lastName: patient.lastName,
			doctorId: patient.doctorId,
		})
		.from(patient)
		.where(eq(patient.userId, patientUserId))
		.limit(1);

	if (rows.length === 0 || !rows[0].doctorId) return;

	const patientName = `${rows[0].firstName} ${rows[0].lastName}`;
	const label = moodLabels[mood];
	const severity = mood === "foarte-rau" ? "CRITIC" : "Atenție";
	await sendPushToUser(rows[0].doctorId, {
		title: `[${severity}] Jurnal — ${patientName}`,
		body: `Pacientul a raportat starea „${label}" în jurnalul de sănătate.`,
	});
}

export async function createJournalEntry(values: unknown) {
	const session = await getSessionOrThrow();
	await assertPatientNotPreTransplant(session.user.role, session.user.id);
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

	await notifyDoctorOfBadMood(session.user.id, parsed.data.mood);

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
	await assertPatientNotPreTransplant(session.user.role, session.user.id);
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
		return { error: "Înregistrarea nu a fost găsită." };
	}
	await db.update(journalEntry).set(parsed.data).where(eq(journalEntry.id, id));

	// Notify doctor if mood transitioned to bad (not on every edit)
	const previousMood = existing[0].mood;
	const newMood = parsed.data.mood;
	const wasBad = previousMood === "rau" || previousMood === "foarte-rau";
	const isBad = newMood === "rau" || newMood === "foarte-rau";
	if (isBad && (!wasBad || previousMood !== newMood)) {
		await notifyDoctorOfBadMood(session.user.id, newMood);
	}

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
		return { error: "Înregistrarea nu a fost găsită." };
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
