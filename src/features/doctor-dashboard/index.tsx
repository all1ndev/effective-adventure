import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { PatientOverviewCard } from "./components/patient-overview-card";
import { AlertSummaryWidget } from "./components/alert-summary-widget";
import { ComplianceChart } from "./components/compliance-chart";
import { patientSummaries } from "./data/summary";
import { alerts } from "@/features/alerts/data/alerts";

export function DoctorDashboard() {
	const activePatients = patientSummaries.filter((p) => p.status === "activ");

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
						<p className="text-3xl font-bold">{patientSummaries.length}</p>
						<p className="text-sm text-muted-foreground">Total pacienti</p>
					</div>
					<div className="rounded-lg border p-4 text-center">
						<p className="text-3xl font-bold text-green-600">
							{activePatients.length}
						</p>
						<p className="text-sm text-muted-foreground">Pacienti activi</p>
					</div>
					<AlertSummaryWidget alerts={alerts} />
				</div>

				<ComplianceChart patients={patientSummaries} />

				<div>
					<h3 className="mb-3 text-lg font-semibold">Pacienti activi</h3>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{patientSummaries.map((p) => (
							<PatientOverviewCard key={p.id} patient={p} />
						))}
					</div>
				</div>
			</Main>
		</>
	);
}
