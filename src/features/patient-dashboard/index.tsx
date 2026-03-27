"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Pill, MessageSquare, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";
import { Button } from "@/components/ui/button";
import { getVitalSigns } from "@/features/vital-signs/actions";
import type { VitalEntry } from "@/features/vital-signs/data/schema";
import { medications } from "@/features/medication/data/medications";
import { conversations } from "@/features/messaging/data/messages";

export function PatientDashboard() {
	const [latestVital, setLatestVital] = useState<VitalEntry | null>(null);

	useEffect(() => {
		getVitalSigns().then((data) => {
			if (data.length > 0) {
				setLatestVital(data[0]);
			}
		});
	}, []);

	const todayMeds = medications.filter((m) => m.patientId === "1");

	const unreadMessages = conversations.reduce(
		(sum, c) => sum + (c.unreadCount ?? 0),
		0,
	);

	return (
		<>
			<Header fixed>
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					<ConfigDrawer />
					<ProfileDropdown />
				</div>
			</Header>

			<Main className="flex flex-1 flex-col gap-6">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Buna ziua!</h2>
					<p className="text-muted-foreground">
						Iata un rezumat al starii tale de sanatate.
					</p>
				</div>

				<div className="grid gap-4 md:grid-cols-3">
					<div className="rounded-lg border p-4 flex items-start gap-3">
						<Activity className="mt-1 h-5 w-5 text-blue-500 shrink-0" />
						<div>
							<p className="text-sm text-muted-foreground">Ultima tensiune</p>
							{latestVital ? (
								<p className="text-2xl font-bold">
									{latestVital.systolic}/{latestVital.diastolic}
								</p>
							) : (
								<p className="text-2xl font-bold text-muted-foreground">—</p>
							)}
							{latestVital && (
								<p className="text-xs text-muted-foreground">
									{latestVital.date}
								</p>
							)}
						</div>
					</div>

					<div className="rounded-lg border p-4 flex items-start gap-3">
						<Pill className="mt-1 h-5 w-5 text-green-500 shrink-0" />
						<div>
							<p className="text-sm text-muted-foreground">Medicamente azi</p>
							<p className="text-2xl font-bold">{todayMeds.length}</p>
							<p className="text-xs text-muted-foreground">
								prescriptii active
							</p>
						</div>
					</div>

					<div className="rounded-lg border p-4 flex items-start gap-3">
						<MessageSquare className="mt-1 h-5 w-5 text-purple-500 shrink-0" />
						<div>
							<p className="text-sm text-muted-foreground">Mesaje necitite</p>
							<p className="text-2xl font-bold">{unreadMessages}</p>
							<p className="text-xs text-muted-foreground">de la medic</p>
						</div>
					</div>
				</div>

				<div>
					<h3 className="mb-3 text-lg font-semibold">Actiuni rapide</h3>
					<div className="grid gap-3 sm:grid-cols-3">
						<Button
							variant="outline"
							className="justify-between h-auto py-3"
							asChild
						>
							<Link href="/vital-signs">
								<span>Inregistreaza semne vitale</span>
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
						<Button
							variant="outline"
							className="justify-between h-auto py-3"
							asChild
						>
							<Link href="/symptoms">
								<span>Raporteaza simptome</span>
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
						<Button
							variant="outline"
							className="justify-between h-auto py-3"
							asChild
						>
							<Link href="/messaging">
								<span>Deschide mesaje</span>
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
					</div>
				</div>
			</Main>
		</>
	);
}
