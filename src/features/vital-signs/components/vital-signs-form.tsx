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

export function VitalSignsForm() {
	const [submitted, setSubmitted] = useState(false);

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSubmitted(true);
		setTimeout(() => setSubmitted(false), 3000);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Inregistreaza semne vitale</CardTitle>
				<CardDescription>Completati valorile masurate astazi.</CardDescription>
			</CardHeader>
			<CardContent>
				{submitted && (
					<div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
						Semnele vitale au fost inregistrate cu succes.
					</div>
				)}
				<form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5">
						<Label htmlFor="systolic">Tensiune sistolica (mmHg)</Label>
						<Input
							id="systolic"
							type="number"
							placeholder="120"
							min={60}
							max={250}
							required
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="diastolic">Tensiune diastolica (mmHg)</Label>
						<Input
							id="diastolic"
							type="number"
							placeholder="80"
							min={40}
							max={150}
							required
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="temperature">Temperatura (°C)</Label>
						<Input
							id="temperature"
							type="number"
							step="0.1"
							placeholder="36.6"
							min={35}
							max={42}
							required
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="pulse">Puls (bpm)</Label>
						<Input
							id="pulse"
							type="number"
							placeholder="72"
							min={30}
							max={200}
							required
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="weight">Greutate (kg)</Label>
						<Input
							id="weight"
							type="number"
							step="0.1"
							placeholder="75.0"
							min={20}
							max={300}
							required
						/>
					</div>
					<div className="flex items-end">
						<Button type="submit" className="w-full">
							Salveaza
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
