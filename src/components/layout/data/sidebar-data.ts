import {
	Bell,
	UserCheck,
	Stethoscope,
	LayoutDashboard,
	Activity,
	Thermometer,
	Pill,
	FlaskConical,
	FileUp,
	MessageSquare,
	BookOpen,
	NotebookPen,
} from "lucide-react";
import { type SidebarData } from "../types";
import { type AppRole } from "@/lib/roles";

const sharedUser = {
	name: "TransplantCare",
	email: "transplantcare@hospital.ro",
	avatar: "/avatars/shadcn.jpg",
};

export const doctorSidebarData: SidebarData = {
	user: sharedUser,
	teams: [],
	navGroups: [
		{
			title: "General",
			items: [
				{
					title: "Panou de control",
					url: "/",
					icon: LayoutDashboard,
				},
				{
					title: "Lista Pacienti",
					url: "/patients",
					icon: Stethoscope,
				},
				{
					title: "Add Patient",
					url: "/add-patient",
					icon: UserCheck,
				},
				{
					title: "Trimitere Analize",
					url: "/send-lab-results",
					icon: FileUp,
				},
				{
					title: "Alerte",
					url: "/alerts",
					icon: Bell,
				},
				{
					title: "Mesagerie",
					url: "/messaging",
					icon: MessageSquare,
				},
			],
		},
	],
};

export const patientSidebarData: SidebarData = {
	user: sharedUser,
	teams: [],
	navGroups: [
		{
			title: "General",
			items: [
				{
					title: "Panou de control",
					url: "/",
					icon: LayoutDashboard,
				},
				{
					title: "Semne Vitale",
					url: "/vital-signs",
					icon: Activity,
				},
				{
					title: "Simptome",
					url: "/symptoms",
					icon: Thermometer,
				},
				{
					title: "Medicatie",
					url: "/medication",
					icon: Pill,
				},
				{
					title: "Rezultate Laborator",
					url: "/lab-results",
					icon: FlaskConical,
				},
				{
					title: "Mesagerie",
					url: "/messaging",
					icon: MessageSquare,
				},
				{
					title: "Educatie",
					url: "/education",
					icon: BookOpen,
				},
				{
					title: "Jurnal",
					url: "/journal",
					icon: NotebookPen,
				},
			],
		},
	],
};

export function getSidebarData(role: AppRole): SidebarData {
	if (role === "admin") return doctorSidebarData;
	return patientSidebarData;
}

// Fallback export so any existing import of `sidebarData` still compiles
export const sidebarData = doctorSidebarData;
