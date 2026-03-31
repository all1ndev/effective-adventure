"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Spinner } from "@/components/ui/spinner";
import { DoctorsTable } from "./components/doctors-table";
import { getDoctors } from "./actions";
import type { Doctor } from "./data/schema";

export function Doctors() {
	const [doctors, setDoctors] = useState<Doctor[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchData = useCallback(() => {
		getDoctors()
			.then((data) => {
				const mapped: Doctor[] = data.map((d) => {
					const result: Record<string, unknown> = {};
					for (const [key, value] of Object.entries(d)) {
						result[key] = value === null ? undefined : value;
					}
					return result as Doctor;
				});
				setDoctors(mapped);
			})
			.catch(() => {
				toast.error("Eroare la încărcarea medicilor.");
			})
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		fetchData();
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
					<h2 className="text-2xl font-bold tracking-tight">Lista Medici</h2>
					<p className="text-muted-foreground">
						Vizualizați și gestionați medicii din sistem.
					</p>
				</div>
				{loading ? (
					<div className="flex flex-1 items-center justify-center">
						<Spinner className="size-6" />
					</div>
				) : (
					<DoctorsTable data={doctors} onRefresh={fetchData} />
				)}
			</Main>
		</>
	);
}
