"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type Mood } from "../data/schema";
import { createJournalEntry } from "../actions";

const moods: { value: Mood; emoji: string; label: string }[] = [
	{ value: "excelent", emoji: "😄", label: "Excelent" },
	{ value: "bine", emoji: "🙂", label: "Bine" },
	{ value: "neutru", emoji: "😐", label: "Neutru" },
	{ value: "rau", emoji: "😕", label: "Rau" },
	{ value: "foarte-rau", emoji: "😞", label: "Foarte rau" },
];

interface JournalEditorProps {
	onSuccess?: () => void;
}

export function JournalEditor({ onSuccess }: JournalEditorProps) {
	const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
	const [content, setContent] = useState("");
	const [isPending, startTransition] = useTransition();
	const [submitted, setSubmitted] = useState(false);

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!selectedMood) return;
		startTransition(async () => {
			const result = await createJournalEntry({ mood: selectedMood, content });
			if (result.error) {
				toast.error(result.error);
				return;
			}
			setSelectedMood(null);
			setContent("");
			setSubmitted(true);
			setTimeout(() => setSubmitted(false), 4000);
			onSuccess?.();
		});
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Noua intrare in jurnal</CardTitle>
				<CardDescription>
					{new Date().toLocaleDateString("ro-RO", {
						weekday: "long",
						day: "numeric",
						month: "long",
						year: "numeric",
					})}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{submitted && (
					<div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
						Intrarea a fost salvata cu succes.
					</div>
				)}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label>Cum va simtiti astazi?</Label>
						<div className="flex flex-wrap gap-2">
							{moods.map((m) => (
								<button
									key={m.value}
									type="button"
									onClick={() => setSelectedMood(m.value)}
									className={cn(
										"flex flex-col items-center gap-1 rounded-lg border px-4 py-2 text-sm transition-colors",
										selectedMood === m.value
											? "border-primary bg-primary/10 text-primary"
											: "hover:bg-muted",
									)}
								>
									<span className="text-2xl">{m.emoji}</span>
									<span className="text-xs">{m.label}</span>
								</button>
							))}
						</div>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="content">Note</Label>
						<Textarea
							id="content"
							placeholder="Cum a fost ziua de azi? Ce ati simtit? Ce ati facut?"
							rows={5}
							required
							value={content}
							onChange={(e) => setContent(e.target.value)}
						/>
					</div>
					<Button type="submit" disabled={!selectedMood || isPending}>
						{isPending ? "Se salveaza..." : "Salveaza intrarea"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
