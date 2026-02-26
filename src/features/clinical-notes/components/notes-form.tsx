"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function NotesForm() {
	const [submitted, setSubmitted] = useState(false);

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSubmitted(true);
		setTimeout(() => setSubmitted(false), 3000);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Nota clinica noua</CardTitle>
				<CardDescription>
					Adaugati observatii clinice pentru aceasta vizita.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{submitted && (
					<div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
						Nota a fost salvata cu succes.
					</div>
				)}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="visitDate">Data vizitei</Label>
						<Input
							id="visitDate"
							type="date"
							defaultValue={new Date().toISOString().split("T")[0]}
							required
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="content">Observatii clinice</Label>
						<Textarea
							id="content"
							placeholder="Descrieti starea pacientului, evolutia, recomandarile..."
							rows={6}
							required
						/>
					</div>
					<Button type="submit">Salveaza nota</Button>
				</form>
			</CardContent>
		</Card>
	);
}
