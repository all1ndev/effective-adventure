"use client";

import { DoctorDashboard } from "@/features/doctor-dashboard";
import { PatientDashboard } from "@/features/patient-dashboard";
import { useSession } from "@/lib/auth-client";
import { getUserRole } from "@/lib/roles";

export default function Page() {
	const { data: session } = useSession();
	const role = getUserRole(session?.user?.role);

	if (role === "admin" || role === "doctor") return <DoctorDashboard />;
	if (role === "user") return <PatientDashboard />;
	return null;
}
