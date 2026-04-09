"use server";

import { eq, desc, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSessionOrThrow } from "@/lib/auth-utils";
import { isMedicRole } from "@/lib/roles";
import { db } from "@/db";
import { notification, notificationRead } from "@/db/notification-schema";
import { patient } from "@/db/patient-schema";
import { medication } from "@/db/medication-schema";
import { user } from "@/db/auth-schema";

type TargetType =
	| "patient"
	| "group"
	| "medication"
	| "category"
	| "compliance"
	| "all"
	| "doctor"
	| "etiology";

interface CreateNotificationInput {
	title: string;
	message: string;
	severity: "critical" | "warning" | "info";
	targetType: TargetType;
	targetValue?: string;
	scheduledAt?: string;
}

async function resolveTargetUserIds(
	targetType: TargetType,
	targetValue?: string,
): Promise<string[]> {
	switch (targetType) {
		case "patient": {
			if (!targetValue) return [];
			const result = await db
				.select({ userId: patient.userId })
				.from(patient)
				.where(eq(patient.id, targetValue));
			return result.filter((r) => r.userId).map((r) => r.userId!);
		}

		case "group": {
			if (!targetValue) return [];
			const ids = targetValue.split(",").map((id) => id.trim());
			const result = await db
				.select({ userId: patient.userId })
				.from(patient)
				.where(inArray(patient.id, ids));
			return result.filter((r) => r.userId).map((r) => r.userId!);
		}

		case "medication": {
			if (!targetValue) return [];
			const result = await db
				.select({ patientId: medication.patientId })
				.from(medication)
				.where(eq(medication.name, targetValue));
			return [...new Set(result.map((r) => r.patientId))];
		}

		case "category": {
			if (!targetValue) return [];
			const result = await db
				.select({ patientId: medication.patientId })
				.from(medication)
				.where(eq(medication.category, targetValue));
			return [...new Set(result.map((r) => r.patientId))];
		}

		case "compliance": {
			const threshold = targetValue ? parseInt(targetValue, 10) : 70;
			const allPatientMeds = await db
				.select({
					patientId: medication.patientId,
					medId: medication.id,
				})
				.from(medication);

			if (allPatientMeds.length === 0) return [];

			const { medicationLog } = await import("@/db/medication-schema");
			const allLogs = await db.select().from(medicationLog);

			const patientCompliance = new Map<
				string,
				{ taken: number; total: number }
			>();
			for (const med of allPatientMeds) {
				const medLogs = allLogs.filter((l) => l.medicationId === med.medId);
				const existing = patientCompliance.get(med.patientId) ?? {
					taken: 0,
					total: 0,
				};
				existing.total += medLogs.length;
				existing.taken += medLogs.filter((l) => l.status === "luat").length;
				patientCompliance.set(med.patientId, existing);
			}

			const lowCompliance: string[] = [];
			for (const [patientId, stats] of patientCompliance) {
				if (stats.total === 0) continue;
				const rate = Math.round((stats.taken / stats.total) * 100);
				if (rate < threshold) {
					lowCompliance.push(patientId);
				}
			}
			return lowCompliance;
		}

		case "all": {
			const result = await db
				.select({ userId: patient.userId })
				.from(patient)
				.where(eq(patient.status, "activ"));
			return result.filter((r) => r.userId).map((r) => r.userId!);
		}

		case "doctor": {
			if (!targetValue) return [];
			const result = await db
				.select({ userId: patient.userId })
				.from(patient)
				.where(eq(patient.doctorId, targetValue));
			return result.filter((r) => r.userId).map((r) => r.userId!);
		}

		case "etiology": {
			if (!targetValue) return [];
			const result = await db
				.select({ userId: patient.userId })
				.from(patient)
				.where(
					eq(
						patient.etiology,
						targetValue as
							| "HBV"
							| "HDV"
							| "HCV"
							| "MASLD"
							| "alcool"
							| "autoimuna"
							| "altele",
					),
				);
			return result.filter((r) => r.userId).map((r) => r.userId!);
		}

		default:
			return [];
	}
}

export async function createNotification(input: CreateNotificationInput) {
	const session = await getSessionOrThrow();

	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}

	const targetUserIds = await resolveTargetUserIds(
		input.targetType,
		input.targetValue,
	);

	if (targetUserIds.length === 0) {
		return { error: "Nu s-au găsit pacienți pentru criteriul selectat." };
	}

	await db.insert(notification).values({
		id: crypto.randomUUID(),
		title: input.title,
		message: input.message,
		severity: input.severity,
		targetType: input.targetType,
		targetValue: input.targetValue ?? null,
		scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
		createdBy: session.user.id,
		createdByName: session.user.name ?? "Medic",
	});

	revalidatePath("/notifications");
	return { success: true, recipientCount: targetUserIds.length };
}

export async function deleteNotification(notificationId: string) {
	const session = await getSessionOrThrow();

	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}

	const [target] = await db
		.select()
		.from(notification)
		.where(eq(notification.id, notificationId))
		.limit(1);

	if (!target) {
		return { error: "Notificarea nu a fost găsită." };
	}

	const elapsed = Date.now() - new Date(target.createdAt).getTime();
	const fiveMinutes = 5 * 60 * 1000;

	if (elapsed > fiveMinutes) {
		return { error: "Notificarea poate fi ștearsă doar în primele 5 minute." };
	}

	await db
		.delete(notificationRead)
		.where(eq(notificationRead.notificationId, notificationId));
	await db.delete(notification).where(eq(notification.id, notificationId));

	revalidatePath("/notifications");
	return { success: true };
}

export async function getNotificationsForPatient() {
	const session = await getSessionOrThrow();
	const userId = session.user.id;

	const allNotifications = await db
		.select()
		.from(notification)
		.orderBy(desc(notification.createdAt));

	const reads = await db
		.select()
		.from(notificationRead)
		.where(eq(notificationRead.userId, userId));

	const readSet = new Set(reads.map((r) => r.notificationId));

	const now = new Date();
	const myNotifications: typeof allNotifications = [];

	for (const n of allNotifications) {
		if (n.scheduledAt && new Date(n.scheduledAt) > now) continue;
		const targets = await resolveTargetUserIds(
			n.targetType as TargetType,
			n.targetValue ?? undefined,
		);
		if (targets.includes(userId)) {
			myNotifications.push(n);
		}
	}

	return myNotifications.map((n) => ({
		...n,
		read: readSet.has(n.id),
	}));
}

export async function markNotificationAsRead(notificationId: string) {
	const session = await getSessionOrThrow();

	const existing = await db
		.select()
		.from(notificationRead)
		.where(
			and(
				eq(notificationRead.notificationId, notificationId),
				eq(notificationRead.userId, session.user.id),
			),
		)
		.limit(1);

	if (existing.length > 0) return { success: true };

	await db.insert(notificationRead).values({
		id: crypto.randomUUID(),
		notificationId,
		userId: session.user.id,
	});

	revalidatePath("/notifications");
	return { success: true };
}

export async function markAllNotificationsAsRead() {
	const session = await getSessionOrThrow();
	const userId = session.user.id;

	const myNotifications = await getNotificationsForPatient();
	const unread = myNotifications.filter((n) => !n.read);

	if (unread.length === 0) return { success: true };

	await db.insert(notificationRead).values(
		unread.map((n) => ({
			id: crypto.randomUUID(),
			notificationId: n.id,
			userId,
		})),
	);

	revalidatePath("/notifications");
	return { success: true };
}

export async function getSentNotifications() {
	const session = await getSessionOrThrow();

	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}

	const notifications = await db
		.select()
		.from(notification)
		.orderBy(desc(notification.createdAt));

	const allReads = await db.select().from(notificationRead);

	const result = [];
	for (const n of notifications) {
		const targets = await resolveTargetUserIds(
			n.targetType as TargetType,
			n.targetValue ?? undefined,
		);
		const reads = allReads.filter((r) => r.notificationId === n.id);
		result.push({
			...n,
			totalRecipients: targets.length,
			readCount: reads.length,
		});
	}

	return result;
}

export async function getTargetPreview(
	targetType: TargetType,
	targetValue?: string,
) {
	const session = await getSessionOrThrow();

	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}

	const userIds = await resolveTargetUserIds(targetType, targetValue);

	if (userIds.length === 0) {
		return { count: 0, patients: [] };
	}

	const patients = await db
		.select({
			firstName: patient.firstName,
			lastName: patient.lastName,
		})
		.from(patient)
		.where(inArray(patient.userId, userIds));

	return {
		count: patients.length,
		patients: patients.slice(0, 5).map((p) => `${p.lastName} ${p.firstName}`),
	};
}

export async function getDoctorsList() {
	const session = await getSessionOrThrow();

	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}

	return db
		.select({ id: user.id, name: user.name })
		.from(user)
		.where(eq(user.role, "doctor"));
}

export async function getPatientsList() {
	const session = await getSessionOrThrow();

	if (!isMedicRole(session.user.role)) {
		throw new Error("Neautorizat");
	}

	return db
		.select({
			id: patient.id,
			firstName: patient.firstName,
			lastName: patient.lastName,
		})
		.from(patient)
		.where(eq(patient.status, "activ"));
}
