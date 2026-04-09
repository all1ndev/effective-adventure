"use client";
import { RoleGuard } from "@/components/role-guard";
import { Alerts } from "@/features/alerts";
import { PushNotificationManager } from "@/components/pwa/push-notification-manager";

export default function AlertsPage() {
	return (
		<RoleGuard allowedRoles={["admin", "doctor"]}>
			<PushNotificationManager />
			<Alerts />
		</RoleGuard>
	);
}
