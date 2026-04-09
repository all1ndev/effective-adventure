"use server";

import { auth } from "@/lib/auth";
import { getSessionOrThrow } from "@/lib/auth-utils";
import { db } from "@/db";
import { doctor } from "@/db/doctor-schema";
import { user } from "@/db/auth-schema";
import { addDoctorFormSchema, editDoctorFormSchema } from "./data/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID, randomBytes } from "crypto";
import { sendCredentialsEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";

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
	const generatedPassword = randomBytes(10).toString("base64url");

	let userId: string | null = null;

	try {
		const newUser = await auth.api.createUser({
			body: {
				name: `${data.firstName} ${data.lastName}`,
				email: data.email,
				password: generatedPassword,
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

		const loginUrl = `${process.env.BETTER_AUTH_URL}/sign-in`;
		await sendCredentialsEmail({
			to: data.email,
			name: `${data.firstName} ${data.lastName}`,
			role: "medic",
			password: generatedPassword,
			loginUrl,
		});

		await logAudit({
			userId: session.user.id,
			userName: session.user.name,
			userRole: session.user.role,
			action: "create",
			entity: "doctor",
			description: `A creat medicul ${data.firstName} ${data.lastName}`,
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

export async function deleteDoctor(id: string) {
	const session = await getSessionOrThrow();
	if (session.user.role !== "admin") {
		return { success: false, error: "Neautorizat" };
	}

	try {
		// Find the doctor's userId first
		const doctorRecord = await db
			.select({ userId: doctor.userId })
			.from(doctor)
			.where(eq(doctor.id, id))
			.limit(1);

		if (!doctorRecord[0]) {
			return { success: false, error: "Medicul nu a fost găsit" };
		}

		const { userId } = doctorRecord[0];

		// Delete the doctor profile
		await db.delete(doctor).where(eq(doctor.id, id));

		// Delete the user account if it exists (cascades sessions, accounts)
		if (userId) {
			await db.delete(user).where(eq(user.id, userId));
		}

		await logAudit({
			userId: session.user.id,
			userName: session.user.name,
			userRole: session.user.role,
			action: "delete",
			entity: "doctor",
			entityId: id,
			description: `A șters un medic`,
		});

		revalidatePath("/doctors");
		return { success: true };
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Eroare la ștergerea medicului";
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

		await logAudit({
			userId: session.user.id,
			userName: session.user.name,
			userRole: session.user.role,
			action: "update",
			entity: "doctor",
			entityId: id,
			description: `A actualizat medicul ${data.firstName} ${data.lastName}`,
		});

		revalidatePath("/doctors");
		return { success: true };
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Eroare la actualizarea medicului";
		return { success: false, error: message };
	}
}
