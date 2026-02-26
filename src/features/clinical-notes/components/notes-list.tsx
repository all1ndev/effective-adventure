import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ClinicalNote } from "../data/schema";

interface NotesListProps {
	notes: ClinicalNote[];
}

export function NotesList({ notes }: NotesListProps) {
	const sorted = [...notes].sort((a, b) =>
		b.visitDate.localeCompare(a.visitDate),
	);
	return (
		<div className="space-y-4">
			{sorted.map((note) => (
				<Card key={note.id}>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-semibold">
								Vizita:{" "}
								{new Date(note.visitDate).toLocaleDateString("ro-RO", {
									day: "numeric",
									month: "long",
									year: "numeric",
								})}
							</CardTitle>
							<span className="text-xs text-muted-foreground">
								{note.author}
							</span>
						</div>
					</CardHeader>
					<CardContent>
						<p className="whitespace-pre-wrap text-sm text-foreground/90">
							{note.content}
						</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
