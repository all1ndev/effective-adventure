"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function MedicationForm() {
	const [submitted, setSubmitted] = useState(false);

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSubmitted(true);
		setTimeout(() => setSubmitted(false), 3000);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Adauga prescriptie</CardTitle>
				<CardDescription>
					Adaugati un medicament nou in schema pacientului.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{submitted && (
					<div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
						Prescriptia a fost adaugata cu succes.
					</div>
				)}
				<form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="name">Nume medicament</Label>
						<Input id="name" placeholder="ex: Tacrolimus" required />
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="dose">Doza</Label>
						<Input id="dose" placeholder="ex: 2 mg" required />
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="frequency">Frecventa</Label>
						<Input id="frequency" placeholder="ex: De 2 ori pe zi" required />
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="startDate">Data incepere</Label>
						<Input id="startDate" type="date" required />
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="endDate">Data expirare (optional)</Label>
						<Input id="endDate" type="date" />
					</div>
					<div className="sm:col-span-2">
						<Button type="submit">Adauga prescriptie</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
