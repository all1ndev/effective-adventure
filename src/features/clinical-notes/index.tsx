"use client";

import { useEffect, useState } from "react";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
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

	function fetchData() {
		getClinicalNotesByPatientId(patientId).then((data) => {
			setNotes(data);
			setLoading(false);
		});
	}

	useEffect(fetchData, [patientId]);

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
					<h2 className="text-2xl font-bold tracking-tight">Note Clinice</h2>
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
