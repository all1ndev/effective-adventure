"use client";

import { useEffect, useState } from "react";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { MedicationCalendar } from "./components/medication-calendar";
import { ComplianceTable } from "./components/compliance-table";
import { RenewalAlert } from "./components/renewal-alert";
import { DailyLogForm } from "./components/daily-log-form";
import { getMedications, getMedicationLogs } from "./actions";
import type { Medication, MedicationLog } from "./data/schema";

export function Medication() {
	const [meds, setMeds] = useState<Medication[]>([]);
	const [logs, setLogs] = useState<MedicationLog[]>([]);

	function fetchData() {
		getMedications().then((data) =>
			setMeds(data.map((m) => ({ ...m, endDate: m.endDate ?? undefined }))),
		);
		getMedicationLogs().then((logsData) =>
			setLogs(
				logsData.map((l) => ({
					id: l.id,
					medicationId: l.medicationId,
					takenAt: l.takenAt,
					status: l.status,
				})),
			),
		);
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
					<h2 className="text-2xl font-bold tracking-tight">Medicatie</h2>
					<p className="text-muted-foreground">
						Schema de medicatie si istoricul de conformitate.
					</p>
				</div>
				<RenewalAlert medications={meds} />
				<DailyLogForm medications={meds} logs={logs} onSuccess={fetchData} />
				<MedicationCalendar medications={meds} logs={logs} />
				<ComplianceTable medications={meds} logs={logs} />
			</Main>
		</>
	);
}
