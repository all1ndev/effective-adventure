import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { LabResultsTable } from "./components/lab-results-table";
import { LabResultsChart } from "./components/lab-results-chart";
import { labResults } from "./data/lab-results";

export function LabResults() {
	const patientResults = labResults.filter((r) => r.patientId === "1");
	const latest = patientResults[0];

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
					<h2 className="text-2xl font-bold tracking-tight">
						Rezultate Laborator
					</h2>
					<p className="text-muted-foreground">
						Vizualizati analizele de sange si evolutia valorilor.
					</p>
				</div>
				{latest && <LabResultsTable result={latest} />}
				<div className="grid gap-4 lg:grid-cols-2">
					<LabResultsChart results={patientResults} testName="ALT (SGPT)" />
					<LabResultsChart results={patientResults} testName="Tacrolimus" />
				</div>
				{patientResults.slice(1).map((r) => (
					<LabResultsTable key={r.id} result={r} />
				))}
			</Main>
		</>
	);
}
