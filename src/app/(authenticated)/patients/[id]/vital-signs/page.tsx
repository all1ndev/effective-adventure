"use client";

import { use, useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { RoleGuard } from "@/components/role-guard";
import { VitalSignsChart } from "@/features/vital-signs/components/vital-signs-chart";
import { VitalSignsTable } from "@/features/vital-signs/components/vital-signs-table";
import { getVitalSignsByPatientId } from "@/features/vital-signs/actions";
import type { VitalEntry } from "@/features/vital-signs/data/schema";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";

export default function PatientVitalSignsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const [data, setData] = useState<VitalEntry[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getVitalSignsByPatientId(id).then((d) => {
			setData(d);
			setLoading(false);
		});
	}, [id]);

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
						Semne Vitale — Pacient #{id}
					</h2>
					<p className="text-muted-foreground">
						Evoluția semnelor vitale ale pacientului.
					</p>
				</div>
				{loading ? (
					<div className="flex flex-1 items-center justify-center">
						<Spinner className="size-6" />
					</div>
				) : (
					<>
						<VitalSignsChart data={data} />
						<VitalSignsTable data={data} />
					</>
				)}
			</Main>
		</RoleGuard>
	);
}
