"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Spinner } from "@/components/ui/spinner";
import { AuditLogTable } from "./components/audit-log-table";
import { type AuditLogRow } from "./components/audit-log-columns";
import { getAuditLogs } from "./actions";

export function AuditLog() {
	const [logs, setLogs] = useState<AuditLogRow[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchData = useCallback(() => {
		getAuditLogs()
			.then((data) => {
				setLogs(data as AuditLogRow[]);
			})
			.catch(() => {
				toast.error("Eroare la încărcarea jurnalului de audit.");
			})
			.finally(() => setLoading(false));
	}, []);

	useEffect(fetchData, [fetchData]);

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
					<h2 className="text-2xl font-bold tracking-tight">Jurnal de audit</h2>
					<p className="text-muted-foreground">
						Istoricul tuturor acțiunilor efectuate în sistem.
					</p>
				</div>
				{loading ? (
					<div className="flex flex-1 items-center justify-center">
						<Spinner className="size-6" />
					</div>
				) : (
					<AuditLogTable data={logs} />
				)}
			</Main>
		</>
	);
}
