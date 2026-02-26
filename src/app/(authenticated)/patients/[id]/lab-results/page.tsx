"use client";
import { use } from "react";
import { RoleGuard } from "@/components/role-guard";
import { LabResultsTable } from "@/features/lab-results/components/lab-results-table";
import { LabResultsChart } from "@/features/lab-results/components/lab-results-chart";
import { LabResultsForm } from "@/features/lab-results/components/lab-results-form";
import { labResults } from "@/features/lab-results/data/lab-results";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";

export default function PatientLabResultsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const results = labResults.filter((r) => r.patientId === id);
	const latest = results[0];

	return (
		<RoleGuard allowedRoles={["medic"]}>
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
						Rezultate Laborator — Pacient #{id}
					</h2>
					<p className="text-muted-foreground">
						Analize si interpretare cu valori de referinta.
					</p>
				</div>
				<LabResultsForm />
				{latest && <LabResultsTable result={latest} />}
				<div className="grid gap-4 lg:grid-cols-2">
					<LabResultsChart results={results} testName="ALT (SGPT)" />
					<LabResultsChart results={results} testName="Tacrolimus" />
				</div>
			</Main>
		</RoleGuard>
	);
}
