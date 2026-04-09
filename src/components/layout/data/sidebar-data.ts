import {
	Bell,
	BellRing,
	UserCheck,
	UserPlus,
	Users,
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
	CalendarDays,
	ScrollText,
} from "lucide-react";
import { type SidebarData } from "../types";
import { type AppRole } from "@/lib/roles";

const sharedUser = {
	name: "TransplantCare",
	email: "transplantcare@hospital.ro",
	avatar: "/avatars/shadcn.jpg",
};

export const adminSidebarData: SidebarData = {
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
					title: "Lista Pacienți",
					url: "/patients",
					icon: Stethoscope,
				},
				{
					title: "Adaugă Pacient",
					url: "/add-patient",
					icon: UserCheck,
				},
				{
					title: "Lista Medici",
					url: "/doctors",
					icon: Users,
				},
				{
					title: "Adaugă Medic",
					url: "/add-doctor",
					icon: UserPlus,
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
					title: "Notificări",
					url: "/notifications",
					icon: BellRing,
				},
				{
					title: "Calendar",
					url: "/calendar",
					icon: CalendarDays,
				},
				{
					title: "Mesagerie",
					url: "/messaging",
					icon: MessageSquare,
				},
				{
					title: "Jurnal de audit",
					url: "/audit-log",
					icon: ScrollText,
				},
			],
		},
	],
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
					title: "Lista Pacienți",
					url: "/patients",
					icon: Stethoscope,
				},
				{
					title: "Adaugă Pacient",
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
					title: "Notificări",
					url: "/notifications",
					icon: BellRing,
				},
				{
					title: "Calendar",
					url: "/calendar",
					icon: CalendarDays,
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
					title: "Medicație",
					url: "/medication",
					icon: Pill,
				},
				{
					title: "Rezultate Laborator",
					url: "/lab-results",
					icon: FlaskConical,
				},
				{
					title: "Notificări",
					url: "/notifications",
					icon: BellRing,
				},
				{
					title: "Calendar",
					url: "/calendar",
					icon: CalendarDays,
				},
				{
					title: "Mesagerie",
					url: "/messaging",
					icon: MessageSquare,
				},
				{
					title: "Educație",
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
	if (role === "admin") return adminSidebarData;
	if (role === "doctor") return doctorSidebarData;
	return patientSidebarData;
}

// Fallback export so any existing import of `sidebarData` still compiles
export const sidebarData = adminSidebarData;
