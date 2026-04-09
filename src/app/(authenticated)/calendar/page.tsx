"use client";

import { useSession } from "@/lib/auth-client";
import { getUserRole } from "@/lib/roles";
import { PatientCalendar } from "@/features/calendar";
import { MedicCalendar } from "@/features/calendar";

export default function CalendarPage() {
	const { data: session, isPending } = useSession();
	const role = getUserRole(session?.user?.role);

	if (isPending || !role) return null;

	if (role === "admin" || role === "doctor") {
		return <MedicCalendar />;
	}

	return <PatientCalendar />;
}
