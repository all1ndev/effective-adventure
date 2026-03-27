"use client";

import { useEffect, useState } from "react";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { VitalSignsForm } from "./components/vital-signs-form";
import { VitalSignsTable } from "./components/vital-signs-table";
import { VitalSignsChart } from "./components/vital-signs-chart";
import { getVitalSigns } from "./actions";
import type { VitalEntry } from "./data/schema";

export function VitalSigns() {
	const [vitalSigns, setVitalSigns] = useState<VitalEntry[]>([]);

	function fetchData() {
		getVitalSigns().then(setVitalSigns);
	}

	 
	useEffect(fetchData, []);

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
					<h2 className="text-2xl font-bold tracking-tight">Semne Vitale</h2>
					<p className="text-muted-foreground">
						Monitorizati tensiunea, temperatura, pulsul si greutatea.
					</p>
				</div>
				<VitalSignsForm onSuccess={fetchData} />
				<VitalSignsChart data={vitalSigns} />
				<VitalSignsTable data={vitalSigns} onUpdate={fetchData} />
			</Main>
		</>
	);
}
