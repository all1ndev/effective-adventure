"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { NotesForm } from "./components/notes-form";
import { NotesList } from "./components/notes-list";
import { getClinicalNotesByPatientId } from "./actions";
import type { ClinicalNote } from "./data/schema";

interface ClinicalNotesProps {
	patientId: string;
}

export function ClinicalNotes({ patientId }: ClinicalNotesProps) {
	const [notes, setNotes] = useState<ClinicalNote[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchData = useCallback(() => {
		getClinicalNotesByPatientId(patientId)
			.then((data) => {
				setNotes(data);
			})
			.catch(() => {
				toast.error("Eroare la încărcarea notelor clinice.");
			})
			.finally(() => setLoading(false));
	}, [patientId]);

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
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						asChild
						className="gap-1"
					>
						<Link href={`/patients/${patientId}`}>
							<ArrowLeft className="h-4 w-4" />
							Înapoi la pacient
						</Link>
					</Button>
				</div>
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Note clinice</h2>
					<p className="text-muted-foreground">
						Observații clinice structurate per vizită.
					</p>
				</div>
				<NotesForm patientId={patientId} onSuccess={fetchData} />
				{loading ? (
					<div className="flex flex-1 items-center justify-center">
						<Spinner className="size-6" />
					</div>
				) : (
					<div>
						<h3 className="mb-3 text-lg font-semibold">Istoricul vizitelor</h3>
						<NotesList notes={notes} />
					</div>
				)}
			</Main>
		</>
	);
}
