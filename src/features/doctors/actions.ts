"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { doctor } from "@/db/doctor-schema";
import { user } from "@/db/auth-schema";
import { addDoctorFormSchema, editDoctorFormSchema } from "./data/schema";
import { eq, asc } from "drizzle-orm";
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

export async function getDoctors() {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		throw new Error("Neautorizat");
	}

	const doctors = await db
		.select({
			id: doctor.id,
			userId: doctor.userId,
			firstName: doctor.firstName,
			lastName: doctor.lastName,
			email: user.email,
			specialization: doctor.specialization,
			phone: doctor.phone,
			licenseNumber: doctor.licenseNumber,
			status: doctor.status,
		})
		.from(doctor)
		.leftJoin(user, eq(doctor.userId, user.id))
		.orderBy(asc(doctor.lastName));

	return doctors;
}

export async function addDoctorWithUser(values: unknown) {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		return { success: false, error: "Neautorizat" };
	}

	const parsed = addDoctorFormSchema.safeParse(values);
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
				email: data.email,
				password: data.password,
				role: "user",
			},
		});

		userId = newUser?.user?.id ?? null;

		// Update role to "doctor" — Better Auth only accepts "admin"|"user"
		if (userId) {
			await db.update(user).set({ role: "doctor" }).where(eq(user.id, userId));
		}
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Eroare la crearea contului";
		return { success: false, error: `Eroare cont utilizator: ${message}` };
	}

	try {
		await db.insert(doctor).values({
			id: randomUUID(),
			userId,
			firstName: data.firstName,
			lastName: data.lastName,
			specialization: data.specialization || null,
			phone: data.phone || null,
			licenseNumber: data.licenseNumber || null,
			status: "activ",
		});

		revalidatePath("/doctors");
		revalidatePath("/add-doctor");
		return { success: true };
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Eroare la salvarea medicului";
		return { success: false, error: message };
	}
}

export async function updateDoctor(id: string, values: unknown) {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		return { success: false, error: "Neautorizat" };
	}

	const parsed = editDoctorFormSchema.safeParse(values);
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
			.update(doctor)
			.set({
				firstName: data.firstName,
				lastName: data.lastName,
				specialization: data.specialization || null,
				phone: data.phone || null,
				licenseNumber: data.licenseNumber || null,
				status: data.status,
				updatedAt: new Date(),
			})
			.where(eq(doctor.id, id));

		// Update user name to keep in sync
		const doctorRecord = await db
			.select({ userId: doctor.userId })
			.from(doctor)
			.where(eq(doctor.id, id))
			.limit(1);

		if (doctorRecord[0]?.userId) {
			await db
				.update(user)
				.set({
					name: `${data.firstName} ${data.lastName}`,
					updatedAt: new Date(),
				})
				.where(eq(user.id, doctorRecord[0].userId));
		}

		revalidatePath("/doctors");
		return { success: true };
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Eroare la actualizarea medicului";
		return { success: false, error: message };
	}
}
