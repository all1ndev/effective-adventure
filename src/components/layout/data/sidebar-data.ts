import {
	Construction,
	LayoutDashboard,
	Monitor,
	Bug,
	ListTodo,
	FileX,
	HelpCircle,
	Lock,
	Bell,
	Package,
	Palette,
	ServerOff,
	Settings,
	Wrench,
	UserCog,
	UserX,
	Users,
	MessagesSquare,
	ShieldCheck,
	AudioWaveform,
	Command,
	GalleryVerticalEnd,
} from "lucide-react";
import { ClerkLogo } from "@/assets/clerk-logo";
import { type SidebarData } from "../types";

export const sidebarData: SidebarData = {
	user: {
		name: "satnaing",
		email: "satnaingdev@gmail.com",
		avatar: "/avatars/shadcn.jpg",
	},
	teams: [
		{
			name: "Shadcn Admin",
			logo: Command,
			plan: "Vite + ShadcnUI",
		},
		{
			name: "Acme Inc",
			logo: GalleryVerticalEnd,
			plan: "Enterprise",
		},
		{
			name: "Acme Corp.",
			logo: AudioWaveform,
			plan: "Startup",
		},
	],
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
					title: "Sarcini",
					url: "/tasks",
					icon: ListTodo,
				},
				{
					title: "Aplicații",
					url: "/apps",
					icon: Package,
				},
				{
					title: "Mesaje",
					url: "/chats",
					badge: "3",
					icon: MessagesSquare,
				},
				{
					title: "Utilizatori",
					url: "/users",
					icon: Users,
				},
				{
					title: "Securizat de Clerk",
					icon: ClerkLogo,
					items: [
						{
							title: "Conectare",
							url: "/clerk/sign-in",
						},
						{
							title: "Înregistrare",
							url: "/clerk/sign-up",
						},
						{
							title: "Gestionare utilizatori",
							url: "/clerk/user-management",
						},
					],
				},
			],
		},
		{
			title: "Pagini",
			items: [
				{
					title: "Autentificare",
					icon: ShieldCheck,
					items: [
						{
							title: "Conectare",
							url: "/sign-in",
						},
						{
							title: "Conectare (2 col.)",
							url: "/sign-in-2",
						},
						{
							title: "Înregistrare",
							url: "/sign-up",
						},
						{
							title: "Parolă uitată",
							url: "/forgot-password",
						},
						{
							title: "OTP",
							url: "/otp",
						},
					],
				},
				{
					title: "Erori",
					icon: Bug,
					items: [
						{
							title: "Neautorizat",
							url: "/errors/unauthorized",
							icon: Lock,
						},
						{
							title: "Interzis",
							url: "/errors/forbidden",
							icon: UserX,
						},
						{
							title: "Nu a fost găsit",
							url: "/errors/not-found",
							icon: FileX,
						},
						{
							title: "Eroare server intern",
							url: "/errors/internal-server-error",
							icon: ServerOff,
						},
						{
							title: "Eroare mentenanță",
							url: "/errors/maintenance-error",
							icon: Construction,
						},
					],
				},
			],
		},
		{
			title: "Altele",
			items: [
				{
					title: "Setări",
					icon: Settings,
					items: [
						{
							title: "Profil",
							url: "/settings",
							icon: UserCog,
						},
						{
							title: "Cont",
							url: "/settings/account",
							icon: Wrench,
						},
						{
							title: "Aspect",
							url: "/settings/appearance",
							icon: Palette,
						},
						{
							title: "Notificări",
							url: "/settings/notifications",
							icon: Bell,
						},
						{
							title: "Afișaj",
							url: "/settings/display",
							icon: Monitor,
						},
					],
				},
				{
					title: "Centru de ajutor",
					url: "/help-center",
					icon: HelpCircle,
				},
			],
		},
	],
};
