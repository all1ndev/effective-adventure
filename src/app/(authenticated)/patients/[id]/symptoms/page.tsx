"use client";

import { use, useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { RoleGuard } from "@/components/role-guard";
import { SymptomsList } from "@/features/symptoms/components/symptoms-list";
import { getSymptomReportsByPatientId } from "@/features/symptoms/actions";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";

export default function PatientSymptomsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const [data, setData] = useState<
		Awaited<ReturnType<typeof getSymptomReportsByPatientId>>
	>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getSymptomReportsByPatientId(id).then((d) => {
			setData(d);
			setLoading(false);
		});
	}, [id]);

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
						Simptome — Pacient #{id}
					</h2>
					<p className="text-muted-foreground">
						Rapoarte de simptome ale pacientului.
					</p>
				</div>
				{loading ? (
					<div className="flex flex-1 items-center justify-center">
						<Spinner className="size-6" />
					</div>
				) : (
					<SymptomsList data={data} />
				)}
			</Main>
		</RoleGuard>
	);
}
