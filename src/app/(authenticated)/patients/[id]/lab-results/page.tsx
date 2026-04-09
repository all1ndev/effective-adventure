"use client";

import { use, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { RoleGuard } from "@/components/role-guard";
import { LabResultsTable } from "@/features/lab-results/components/lab-results-table";
import { LabResultsChart } from "@/features/lab-results/components/lab-results-chart";
import { getLabResultsByPatientId } from "@/features/lab-results/actions";
import type { LabResult } from "@/features/lab-results/data/schema";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";

export default function PatientLabResultsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const [results, setResults] = useState<LabResult[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchData = useCallback(() => {
		getLabResultsByPatientId(id)
			.then((data) => {
				setResults(data);
			})
			.catch(() => {
				toast.error("Eroare la încărcarea rezultatelor de laborator.");
			})
			.finally(() => setLoading(false));
	}, [id]);

	useEffect(fetchData, [fetchData]);

	const latest = results[0];

	return (
		<RoleGuard allowedRoles={["admin", "doctor"]}>
			<Header fixed>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					<ConfigDrawer />
				</div>
			</Header>
			<Main className="flex flex-1 flex-col gap-6">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">
						Rezultate Laborator — Pacient #{id}
					</h2>
					<p className="text-muted-foreground">
						Analize și interpretare cu valori de referință.
					</p>
				</div>
				{loading ? (
					<div className="flex flex-1 items-center justify-center">
						<Spinner className="size-6" />
					</div>
				) : (
					<>
						{latest && <LabResultsTable result={latest} />}
						<div className="grid gap-4 lg:grid-cols-2">
							<LabResultsChart results={results} testName="ALT (SGPT)" />
							<LabResultsChart results={results} testName="Tacrolimus" />
						</div>
					</>
				)}
			</Main>
		</RoleGuard>
	);
}
