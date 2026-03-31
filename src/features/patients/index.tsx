"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Spinner } from "@/components/ui/spinner";
import { PatientsTable } from "./components/patients-table";
import { getPatients, getAdmins } from "./actions";
import type { Patient } from "./data/schema";

interface Admin {
	id: string;
	name: string;
	email: string;
}

export function Patients() {
	const [patients, setPatients] = useState<Patient[]>([]);
	const [admins, setAdmins] = useState<Admin[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchData = useCallback(() => {
		getPatients()
			.then((data) => {
				const mapped: Patient[] = data.map((p) => {
					const result: Record<string, unknown> = {};
					for (const [key, value] of Object.entries(p)) {
						result[key] = value === null ? undefined : value;
					}
					return result as Patient;
				});
				setPatients(mapped);
			})
			.catch(() => {
				toast.error("Eroare la încărcarea pacienților.");
			})
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		fetchData();
		getAdmins()
			.then(setAdmins)
			.catch(() => {});
	}, [fetchData]);

	return (
		<>
			<Header fixed>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					<ConfigDrawer />
				</div>
			</Header>

			<Main className="flex flex-1 flex-col gap-4 sm:gap-6">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Lista Pacienti</h2>
					<p className="text-muted-foreground">
						Vizualizati si gestionati pacientii cu transplant hepatic.
					</p>
				</div>
				{loading ? (
					<div className="flex flex-1 items-center justify-center">
						<Spinner className="size-6" />
					</div>
				) : (
					<PatientsTable
						data={patients}
						admins={admins}
						onRefresh={fetchData}
					/>
				)}
			</Main>
		</>
	);
}
