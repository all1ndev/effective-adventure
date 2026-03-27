"use client";

import { use, useEffect, useState } from "react";
import { RoleGuard } from "@/components/role-guard";
import { MedicationForm } from "@/features/medication/components/medication-form";
import { ComplianceTable } from "@/features/medication/components/compliance-table";
import { RenewalAlert } from "@/features/medication/components/renewal-alert";
import {
	getMedicationsByPatientId,
	getMedicationLogsByPatientId,
} from "@/features/medication/actions";
import type {
	Medication,
	MedicationLog,
} from "@/features/medication/data/schema";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";

export default function PatientMedicationPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const [meds, setMeds] = useState<Medication[]>([]);
	const [logs, setLogs] = useState<MedicationLog[]>([]);

	function fetchData() {
		getMedicationsByPatientId(id).then((data) =>
			setMeds(data.map((m) => ({ ...m, endDate: m.endDate ?? undefined }))),
		);
		getMedicationLogsByPatientId(id).then((logsData) =>
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

	 
	useEffect(fetchData, [id]);

	return (
		<RoleGuard allowedRoles={["admin"]}>
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
						Medicatie — Pacient #{id}
					</h2>
					<p className="text-muted-foreground">
						Gestionati prescriptiile si conformitatea.
					</p>
				</div>
				<RenewalAlert medications={meds} />
				<MedicationForm patientId={id} onSuccess={fetchData} />
				<ComplianceTable medications={meds} logs={logs} />
			</Main>
		</RoleGuard>
	);
}
