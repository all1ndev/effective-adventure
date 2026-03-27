"use client";

import { useEffect, useState } from "react";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Spinner } from "@/components/ui/spinner";
import { SymptomsForm } from "./components/symptoms-form";
import { SymptomsList } from "./components/symptoms-list";
import { getSymptomReports } from "./actions";

type SymptomReportRow = Awaited<ReturnType<typeof getSymptomReports>>[number];

export function Symptoms() {
	const [reports, setReports] = useState<SymptomReportRow[]>([]);
	const [loading, setLoading] = useState(true);

	function fetchData() {
		getSymptomReports().then((data) => {
			setReports(data);
			setLoading(false);
		});
	}

	useEffect(fetchData, []);

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
					<h2 className="text-2xl font-bold tracking-tight">Simptome</h2>
					<p className="text-muted-foreground">
						Raportați simptomele zilnice pentru monitorizare medicală.
					</p>
				</div>
				<SymptomsForm onSuccess={fetchData} />
				{loading ? (
					<div className="flex flex-1 items-center justify-center">
						<Spinner className="size-6" />
					</div>
				) : (
					<div>
						<h3 className="mb-3 text-lg font-semibold">Istoric rapoarte</h3>
						<SymptomsList data={reports} onUpdate={fetchData} />
					</div>
				)}
			</Main>
		</>
	);
}
