"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RoleGuard } from "@/components/role-guard";
import { LabResultsTable } from "@/features/lab-results/components/lab-results-table";
import { LabResultsChart } from "@/features/lab-results/components/lab-results-chart";
import { getLabResultsByPatientId } from "@/features/lab-results/actions";
import { getPatientById } from "@/features/patients/actions";
import type { LabResult } from "@/features/lab-results/data/schema";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";

export default function PatientLabResultsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const [results, setResults] = useState<LabResult[]>([]);
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
		getLabResultsByPatientId(id)
			.then((data) => {
				setResults(data);
			})
			.catch(() => {
				toast.error("Eroare la încărcarea rezultatelor de laborator.");
			})
			.finally(() => setLoading(false));
	}, [id]);

	useEffect(fetchData, [fetchData]);

	const latest = results[0];

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
						Rezultate laborator{patientName ? ` — ${patientName}` : ""}
					</h2>
					<p className="text-muted-foreground">
						Analize și interpretare cu valori de referință.
					</p>
				</div>
				{loading ? (
					<div className="flex flex-1 items-center justify-center">
						<Spinner className="size-6" />
					</div>
				) : (
					<>
						{latest && <LabResultsTable result={latest} />}
						<div className="grid gap-4 lg:grid-cols-2">
							<LabResultsChart results={results} testName="ALT (SGPT)" />
							<LabResultsChart results={results} testName="Tacrolimus" />
						</div>
					</>
				)}
			</Main>
		</RoleGuard>
	);
}
