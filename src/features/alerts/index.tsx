"use client";

import { useEffect, useState } from "react";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { AlertsList } from "./components/alerts-list";
import { getAlerts } from "./actions";

type AlertRow = Awaited<ReturnType<typeof getAlerts>>[number];

export function Alerts() {
	const [alerts, setAlerts] = useState<AlertRow[]>([]);

	function fetchData() {
		getAlerts().then(setAlerts);
	}

	 
	useEffect(fetchData, []);

	const activeCount = alerts.filter((a) => !a.dismissed).length;

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
						Alerte{" "}
						{activeCount > 0 && (
							<span className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-sm font-normal text-destructive-foreground">
								{activeCount}
							</span>
						)}
					</h2>
					<p className="text-muted-foreground">
						Alerte clinice prioritizate pentru pacientii monitorizati.
					</p>
				</div>
				<AlertsList data={alerts} onUpdate={fetchData} />
			</Main>
		</>
	);
}
