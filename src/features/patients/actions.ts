"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { patient } from "@/db/patient-schema";
import { medication } from "@/db/medication-schema";
import { conversation } from "@/db/messaging-schema";
import {
	patientFormSchema,
	addPatientFormSchema,
	editPatientFormSchema,
} from "./data/schema";
import { eq, asc, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

async function getSessionOrThrow() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		throw new Error("Neautorizat");
	}
	return session;
}

export async function getAdmins() {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	const { user } = await import("@/db/auth-schema");
	const admins = await db
		.select({ id: user.id, name: user.name, email: user.email })
		.from(user)
		.where(eq(user.role, "admin"))
		.orderBy(asc(user.name));

	return admins;
}

export async function getPatients() {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	return db
		.select()
		.from(patient)
		.where(eq(patient.doctorId, session.user.id))
		.orderBy(asc(patient.lastName));
}

export async function getRecentPatients() {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	return db
		.select({
			id: patient.id,
			firstName: patient.firstName,
			lastName: patient.lastName,
			patientCode: patient.patientCode,
			etiology: patient.etiology,
			transplantDate: patient.transplantDate,
			status: patient.status,
		})
		.from(patient)
		.where(eq(patient.doctorId, session.user.id))
		.orderBy(desc(patient.createdAt))
		.limit(5);
}

export async function addPatientWithUser(values: unknown) {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		return { success: false, error: "Neautorizat" };
	}

	const parsed = addPatientFormSchema.safeParse(values);
	if (!parsed.success) {
		const fieldErrors: Record<string, string> = {};
		for (const issue of parsed.error.issues) {
			const field = issue.path[0];
			if (field) {
				fieldErrors[String(field)] = issue.message;
			}
		}
		return { success: false, error: "Date invalide", fieldErrors };
	}

	const data = parsed.data;

	let userId: string | null = null;

	try {
		const newUser = await auth.api.createUser({
			body: {
				name: `${data.firstName} ${data.lastName}`,
				email: data.patientEmail,
				password: data.patientPassword,
				role: "user",
			},
		});

		userId = newUser?.user?.id ?? null;
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Eroare la crearea contului";
		return { success: false, error: `Eroare cont utilizator: ${message}` };
	}

	try {
		const patientId = randomUUID();

		await db.insert(patient).values({
			id: patientId,
			userId,
			doctorId: data.doctorAccount || null,
			patientCode: data.patientId,
			firstName: data.firstName,
			lastName: data.lastName,
			patientPhone: data.patientPhone || null,
			sex: data.sex,
			age: data.age ?? null,
			weightKg: data.weightKg ?? null,
			heightCm: data.heightCm ?? null,
			bmi: data.bmi ?? null,
			nationality: data.nationality || null,
			preferredLanguage: data.preferredLanguage,
			etiology: data.etiology,
			etiologyOther: data.etiologyOther || null,
			transplantDate: data.transplantDate || null,
			donorType: data.donorType,
			donorAntiHbc: data.donorAntiHbc,
			donorHbsAg: data.donorHbsAg,
			rejectionHistory: data.rejectionHistory,
			rejectionDate: data.rejectionDate || null,
			rejectionType: data.rejectionHistory ? data.rejectionType : null,
			majorComplications: data.majorComplications || null,
			immunosuppressants: data.immunosuppressants,
			antiviralProphylaxis: data.antiviralProphylaxis,
			hbIg: data.hbIg,
			hbIgRoute: data.hbIg ? data.hbIgRoute : null,
			hbIgFrequency: data.hbIg ? data.hbIgFrequency || null : null,
			otherMeds: data.otherMeds || null,
			status: "activ",
		});

		// Create medication records from selected medications
		if (userId) {
			const today = new Date().toISOString().split("T")[0];
			const medicationRecords: {
				id: string;
				patientId: string;
				name: string;
				dose: string;
				frequency: string;
				startDate: string;
			}[] = [];

			for (const med of data.immunosuppressants ?? []) {
				medicationRecords.push({
					id: randomUUID(),
					patientId: userId,
					name: med,
					dose: "-",
					frequency: "-",
					startDate: today,
				});
			}
			for (const med of data.antiviralProphylaxis ?? []) {
				medicationRecords.push({
					id: randomUUID(),
					patientId: userId,
					name: med,
					dose: "-",
					frequency: "-",
					startDate: today,
				});
			}
			if (data.hbIg) {
				medicationRecords.push({
					id: randomUUID(),
					patientId: userId,
					name: "HB-Ig",
					dose: "-",
					frequency: data.hbIgFrequency || "-",
					startDate: today,
				});
			}
			if (data.otherMeds) {
				for (const med of data.otherMeds
					.split(",")
					.map((m) => m.trim())
					.filter(Boolean)) {
					medicationRecords.push({
						id: randomUUID(),
						patientId: userId,
						name: med,
						dose: "-",
						frequency: "-",
						startDate: today,
					});
				}
			}

			if (medicationRecords.length > 0) {
				await db.insert(medication).values(medicationRecords);
			}

			// Create conversation between patient and responsible medic
			const patientName = `${data.firstName} ${data.lastName}`;
			await db.insert(conversation).values({
				id: randomUUID(),
				patientId: userId,
				patientName,
				lastMessage: "",
				unreadCount: 0,
			});
		}

		revalidatePath("/patients");
		revalidatePath("/add-patient");
		revalidatePath("/medication");
		revalidatePath("/messaging");
		return { success: true };
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Eroare la salvarea pacientului";
		return { success: false, error: message };
	}
}

export async function updateFullPatient(id: string, values: unknown) {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		return { success: false, error: "Neautorizat" };
	}

	const parsed = editPatientFormSchema.safeParse(values);
	if (!parsed.success) {
		const fieldErrors: Record<string, string> = {};
		for (const issue of parsed.error.issues) {
			const field = issue.path[0];
			if (field) {
				fieldErrors[String(field)] = issue.message;
			}
		}
		return { success: false, error: "Date invalide", fieldErrors };
	}

	const data = parsed.data;

	try {
		await db
			.update(patient)
			.set({
				doctorId: data.doctorAccount || null,
				patientCode: data.patientCode,
				firstName: data.firstName,
				lastName: data.lastName,
				patientPhone: data.patientPhone || null,
				sex: data.sex,
				age: data.age ?? null,
				weightKg: data.weightKg ?? null,
				heightCm: data.heightCm ?? null,
				bmi: data.bmi ?? null,
				nationality: data.nationality || null,
				preferredLanguage: data.preferredLanguage,
				etiology: data.etiology,
				etiologyOther: data.etiologyOther || null,
				transplantDate: data.transplantDate || null,
				donorType: data.donorType,
				donorAntiHbc: data.donorAntiHbc,
				donorHbsAg: data.donorHbsAg,
				rejectionHistory: data.rejectionHistory,
				rejectionDate: data.rejectionDate || null,
				rejectionType: data.rejectionHistory ? data.rejectionType : null,
				majorComplications: data.majorComplications || null,
				immunosuppressants: data.immunosuppressants,
				antiviralProphylaxis: data.antiviralProphylaxis,
				hbIg: data.hbIg,
				hbIgRoute: data.hbIg ? data.hbIgRoute : null,
				hbIgFrequency: data.hbIg ? data.hbIgFrequency || null : null,
				otherMeds: data.otherMeds || null,
				status: data.status,
				updatedAt: new Date(),
			})
			.where(eq(patient.id, id));

		revalidatePath("/patients");
		return { success: true };
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Eroare la actualizarea pacientului";
		return { success: false, error: message };
	}
}

export async function createPatient(values: unknown) {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	const parsed = patientFormSchema.safeParse(values);
	if (!parsed.success) {
		throw new Error("Date invalide");
	}

	await db.insert(patient).values({
		id: randomUUID(),
		patientCode: randomUUID().slice(0, 8),
		...parsed.data,
	});

	revalidatePath("/patients");
}

export async function updatePatient(id: string, values: unknown) {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	const parsed = patientFormSchema.safeParse(values);
	if (!parsed.success) {
		throw new Error("Date invalide");
	}

	await db
		.update(patient)
		.set({
			...parsed.data,
			updatedAt: new Date(),
		})
		.where(eq(patient.id, id));

	revalidatePath("/patients");
}

export async function deletePatient(id: string) {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	await db.delete(patient).where(eq(patient.id, id));

	revalidatePath("/patients");
}
