"use client";

import { DoctorDashboard } from "@/features/doctor-dashboard";
import { PatientDashboard } from "@/features/patient-dashboard";
import { getUserRole } from "@/lib/roles";

export default function Page() {
	// TODO: implement role system with better-auth
	const role = getUserRole({ role: ["pacient"] });

	if (role === "medic") return <DoctorDashboard />;
	if (role === "pacient") return <PatientDashboard />;
	return null;
}
