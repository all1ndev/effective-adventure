"use client";
import { use } from "react";
import { RoleGuard } from "@/components/role-guard";
import { SymptomsList } from "@/features/symptoms/components/symptoms-list";
import { symptomReports } from "@/features/symptoms/data/symptoms";
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
	const data = symptomReports.filter((r) => r.patientId === id);

	return (
		<RoleGuard allowedRoles={["medic"]}>
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
				<SymptomsList data={data} />
			</Main>
		</RoleGuard>
	);
}
