"use client";

import { DoctorDashboard } from "@/features/doctor-dashboard";
import { PatientDashboard } from "@/features/patient-dashboard";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { useSession } from "@/lib/auth-client";
import { getUserRole } from "@/lib/roles";

export default function Page() {
	const { data: session } = useSession();
	const role = getUserRole(session?.user?.role);

	if (role === "admin" || role === "doctor")
		return (
			<>
				<InstallPrompt />
				<DoctorDashboard />
			</>
		);
	if (role === "user")
		return (
			<>
				<InstallPrompt />
				<PatientDashboard />
			</>
		);
	return null;
}
