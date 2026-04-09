"use server";

import {
	getNotificationsForPatient,
	getSentNotifications,
} from "@/features/notifications/actions";

export async function getAppointmentsForPatient() {
	const notifications = await getNotificationsForPatient();
	return notifications.filter((n) => n.scheduledAt !== null);
}

export async function getAppointmentsForMedic() {
	const notifications = await getSentNotifications();
	return notifications.filter((n) => n.scheduledAt !== null);
}
