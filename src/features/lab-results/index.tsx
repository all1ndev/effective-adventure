"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Spinner } from "@/components/ui/spinner";
import { LabResultsTable } from "./components/lab-results-table";
import { LabResultsChart } from "./components/lab-results-chart";
import { getLabResults } from "./actions";
import type { LabResult } from "./data/schema";

export function LabResults() {
	const [results, setResults] = useState<LabResult[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchData = useCallback(() => {
		getLabResults()
			.then((data) => {
				setResults(data);
			})
			.catch(() => {
				toast.error("Eroare la încărcarea rezultatelor de laborator.");
			})
			.finally(() => setLoading(false));
	}, []);

	useEffect(fetchData, [fetchData]);

	const latest = results[0];

	return (
		<>
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
						Rezultate Laborator
					</h2>
					<p className="text-muted-foreground">
						Vizualizați analizele de sânge și evoluția valorilor.
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
						{results.slice(1).map((r) => (
							<LabResultsTable key={r.id} result={r} />
						))}
					</>
				)}
			</Main>
		</>
	);
}
