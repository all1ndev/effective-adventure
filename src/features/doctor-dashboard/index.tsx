"use client";

import { useEffect, useState } from "react";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { PatientOverviewCard } from "./components/patient-overview-card";
import { AlertSummaryWidget } from "./components/alert-summary-widget";
import { ComplianceChart } from "./components/compliance-chart";
import { Spinner } from "@/components/ui/spinner";
import { getDoctorDashboardData } from "./actions";

type DashboardData = Awaited<ReturnType<typeof getDoctorDashboardData>>;

export function DoctorDashboard() {
	const [data, setData] = useState<DashboardData | null>(null);

	useEffect(() => {
		getDoctorDashboardData().then(setData);
	}, []);

	if (!data) {
		return (
			<>
				<Header fixed>
					<Search />
					<div className="ms-auto flex items-center space-x-4">
						<ThemeSwitch />
						<ConfigDrawer />
						<ProfileDropdown />
					</div>
				</Header>
				<Main className="flex flex-1 items-center justify-center">
					<Spinner className="size-6" />
				</Main>
			</>
		);
	}

	const activePatients = data.patients.filter((p) => p.status === "activ");

	return (
		<>
			<Header fixed>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					<ConfigDrawer />
					<ProfileDropdown />
				</div>
			</Header>

			<Main className="flex flex-1 flex-col gap-6">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Dashboard Medic</h2>
					<p className="text-muted-foreground">
						Privire de ansamblu asupra pacientilor monitorizati.
					</p>
				</div>

				<div className="grid gap-4 md:grid-cols-3">
					<div className="rounded-lg border p-4 text-center">
						<p className="text-3xl font-bold">{data.patients.length}</p>
						<p className="text-sm text-muted-foreground">Total pacienti</p>
					</div>
					<div className="rounded-lg border p-4 text-center">
						<p className="text-3xl font-bold text-green-600">
							{activePatients.length}
						</p>
						<p className="text-sm text-muted-foreground">Pacienti activi</p>
					</div>
					<AlertSummaryWidget alerts={data.alerts} />
				</div>

				<ComplianceChart patients={data.patients} />

				<div>
					<h3 className="mb-3 text-lg font-semibold">Pacienti activi</h3>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{activePatients.map((p) => (
							<PatientOverviewCard key={p.id} patient={p} />
						))}
					</div>
				</div>
			</Main>
		</>
	);
}
