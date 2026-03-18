"use client";

import { useAuthStore } from "@/stores/auth-store";
import { getUserRole } from "@/lib/roles";
import { DoctorDashboard } from "@/features/doctor-dashboard";
import { PatientDashboard } from "@/features/patient-dashboard";

export default function Page() {
	const { auth } = useAuthStore();
	const role = getUserRole(auth.user);

	if (role === "medic") return <DoctorDashboard />;
	if (role === "pacient") return <PatientDashboard />;
	return null;
}
