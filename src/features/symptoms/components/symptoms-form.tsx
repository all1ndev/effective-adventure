"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { symptomOptions } from "../data/symptom-options";

export function SymptomsForm() {
	const [selected, setSelected] = useState<string[]>([]);
	const [submitted, setSubmitted] = useState(false);

	function toggle(symptom: string) {
		setSelected((prev) =>
			prev.includes(symptom)
				? prev.filter((s) => s !== symptom)
				: [...prev, symptom],
		);
	}

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSubmitted(true);
		setSelected([]);
		setTimeout(() => setSubmitted(false), 3000);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Raporteaza simptome</CardTitle>
				<CardDescription>
					Selectati simptomele pe care le resimtiti astazi.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{submitted && (
					<div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
						Simptomele au fost raportate cu succes.
					</div>
				)}
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="grid gap-3 sm:grid-cols-2">
						{symptomOptions.map((symptom) => (
							<div key={symptom} className="flex items-center space-x-2">
								<Checkbox
									id={symptom}
									checked={selected.includes(symptom)}
									onCheckedChange={() => toggle(symptom)}
								/>
								<Label
									htmlFor={symptom}
									className="cursor-pointer text-sm font-normal"
								>
									{symptom}
								</Label>
							</div>
						))}
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="severity">Severitate</Label>
						<Select required>
							<SelectTrigger id="severity">
								<SelectValue placeholder="Selectati severitatea" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="usoara">Usoara</SelectItem>
								<SelectItem value="moderata">Moderata</SelectItem>
								<SelectItem value="severa">Severa</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="notes">Note suplimentare</Label>
						<Textarea
							id="notes"
							placeholder="Descrieti mai detaliat ce simtiti..."
							rows={3}
						/>
					</div>
					<Button type="submit" disabled={selected.length === 0}>
						Trimite raport
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
