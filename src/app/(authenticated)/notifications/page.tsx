"use client";

import { useSession } from "@/lib/auth-client";
import { getUserRole } from "@/lib/roles";
import { SendNotifications } from "@/features/notifications";
import { PatientNotifications } from "@/features/notifications/patient-notifications";
import { PushPromptInline } from "@/components/pwa/push-prompt-inline";

export default function NotificationsPage() {
	const { data: session, isPending } = useSession();
	const role = getUserRole(session?.user?.role);

	if (isPending || !role) return null;

	if (role === "admin" || role === "doctor") {
		return (
			<>
				<PushPromptInline />
				<SendNotifications />
			</>
		);
	}

	return (
		<>
			<PushPromptInline />
			<PatientNotifications />
		</>
	);
}
