"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleGuard } from "@/components/role-guard";
import { MedicationForm } from "@/features/medication/components/medication-form";
import { ComplianceTable } from "@/features/medication/components/compliance-table";
import { RenewalAlert } from "@/features/medication/components/renewal-alert";
import {
	getMedicationsByPatientId,
	getMedicationLogsByPatientId,
} from "@/features/medication/actions";
import { getPatientById } from "@/features/patients/actions";
import type {
	Medication,
	MedicationLog,
} from "@/features/medication/data/schema";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
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
	const [patientName, setPatientName] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getPatientById(id)
			.then((p) => {
				if (p) setPatientName(`${p.lastName} ${p.firstName}`);
			})
			.catch(() => {});
	}, [id]);

	const fetchData = useCallback(() => {
		Promise.all([
			getMedicationsByPatientId(id).then((data) =>
				setMeds(
					data.map((m) => ({
						...m,
						endDate: m.endDate ?? undefined,
						category: m.category ?? "altele",
					})),
				),
			),
			getMedicationLogsByPatientId(id).then((logsData) =>
				setLogs(
					logsData.map((l) => ({
						id: l.id,
						medicationId: l.medicationId,
						takenAt: l.takenAt,
						status: l.status,
					})),
				),
			),
		])
			.catch(() => {
				toast.error("Eroare la încărcarea medicației.");
			})
			.finally(() => setLoading(false));
	}, [id]);

	useEffect(fetchData, [fetchData]);

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
						Medicație{patientName ? ` — ${patientName}` : ""}
					</h2>
					<p className="text-muted-foreground">
						Gestionați prescripțiile și conformitatea.
					</p>
				</div>
				{loading ? (
					<div className="flex flex-1 items-center justify-center">
						<Spinner className="size-6" />
					</div>
				) : (
					<>
						<RenewalAlert medications={meds} />
						<MedicationForm patientId={id} onSuccess={fetchData} />
						<Tabs defaultValue="toate" className="w-full">
							<TabsList>
								<TabsTrigger value="toate">Toate</TabsTrigger>
								<TabsTrigger value="imunosupresor">Imunosupresoare</TabsTrigger>
								<TabsTrigger value="antiviral">Antivirale</TabsTrigger>
								<TabsTrigger value="hbig">HB-Ig</TabsTrigger>
								<TabsTrigger value="altele">Altele</TabsTrigger>
							</TabsList>
							<TabsContent value="toate">
								<ComplianceTable
									medications={meds}
									logs={logs}
									patientId={id}
									onUpdate={fetchData}
								/>
							</TabsContent>
							<TabsContent value="imunosupresor">
								<ComplianceTable
									medications={meds}
									logs={logs}
									patientId={id}
									onUpdate={fetchData}
									category="imunosupresor"
								/>
							</TabsContent>
							<TabsContent value="antiviral">
								<ComplianceTable
									medications={meds}
									logs={logs}
									patientId={id}
									onUpdate={fetchData}
									category="antiviral"
								/>
							</TabsContent>
							<TabsContent value="hbig">
								<ComplianceTable
									medications={meds}
									logs={logs}
									patientId={id}
									onUpdate={fetchData}
									category="hbig"
								/>
							</TabsContent>
							<TabsContent value="altele">
								<ComplianceTable
									medications={meds}
									logs={logs}
									patientId={id}
									onUpdate={fetchData}
									category="altele"
								/>
							</TabsContent>
						</Tabs>
					</>
				)}
			</Main>
		</RoleGuard>
	);
}
