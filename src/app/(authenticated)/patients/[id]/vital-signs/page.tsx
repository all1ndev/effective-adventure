"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RoleGuard } from "@/components/role-guard";
import { VitalSignsChart } from "@/features/vital-signs/components/vital-signs-chart";
import { VitalSignsTable } from "@/features/vital-signs/components/vital-signs-table";
import { getVitalSignsByPatientId } from "@/features/vital-signs/actions";
import { getPatientById } from "@/features/patients/actions";
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
	const [patientName, setPatientName] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getVitalSignsByPatientId(id)
			.then((d) => {
				setData(d);
			})
			.catch(() => {
				toast.error("Eroare la încărcarea semnelor vitale.");
			})
			.finally(() => setLoading(false));
	}, [id]);

	useEffect(() => {
		getPatientById(id)
			.then((p) => {
				if (p) setPatientName(`${p.lastName} ${p.firstName}`);
			})
			.catch(() => {});
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
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						asChild
						className="gap-1"
					>
						<Link href={`/patients/${id}`}>
							<ArrowLeft className="h-4 w-4" />
							Înapoi la pacient
						</Link>
					</Button>
				</div>
				<div>
					<h2 className="text-2xl font-bold tracking-tight">
						Semne vitale{patientName ? ` — ${patientName}` : ""}
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
