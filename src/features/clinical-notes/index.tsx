import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { NotesForm } from "./components/notes-form";
import { NotesList } from "./components/notes-list";
import { clinicalNotes } from "./data/notes";

interface ClinicalNotesProps {
	patientId?: string;
}

export function ClinicalNotes({ patientId = "1" }: ClinicalNotesProps) {
	const notes = clinicalNotes.filter((n) => n.patientId === patientId);

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
						Observatii clinice structurate per vizita.
					</p>
				</div>
				<NotesForm />
				<div>
					<h3 className="mb-3 text-lg font-semibold">Istoricul vizitelor</h3>
					<NotesList notes={notes} />
				</div>
			</Main>
		</>
	);
}
