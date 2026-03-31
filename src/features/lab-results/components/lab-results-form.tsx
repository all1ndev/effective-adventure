"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { createLabResult, createLabResultForPatient } from "../actions";

interface TestRow {
	id: number;
	name: string;
	value: string;
	unit: string;
	refMin: string;
	refMax: string;
}

interface LabResultsFormProps {
	patientId?: string;
	onSuccess?: () => void;
}

export function LabResultsForm({ patientId, onSuccess }: LabResultsFormProps) {
	const [isPending, startTransition] = useTransition();
	const [submitted, setSubmitted] = useState(false);
	const [date, setDate] = useState("");
	const [rows, setRows] = useState<TestRow[]>([
		{ id: 1, name: "", value: "", unit: "", refMin: "", refMax: "" },
	]);

	function addRow() {
		setRows((prev) => [
			...prev,
			{ id: Date.now(), name: "", value: "", unit: "", refMin: "", refMax: "" },
		]);
	}

	function removeRow(id: number) {
		setRows((prev) => prev.filter((r) => r.id !== id));
	}

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		startTransition(async () => {
			const tests = rows.map((r) => ({
				name: r.name,
				value: Number(r.value),
				unit: r.unit,
				refMin: Number(r.refMin),
				refMax: Number(r.refMax),
			}));

			const values = { date, tests };
			const result = patientId
				? await createLabResultForPatient(patientId, values)
				: await createLabResult(values);

			if (result.error) {
				toast.error(result.error);
				return;
			}

			toast.success("Rezultatele au fost salvate cu succes.");
			setDate("");
			setRows([
				{ id: 1, name: "", value: "", unit: "", refMin: "", refMax: "" },
			]);
			setSubmitted(true);
			setTimeout(() => setSubmitted(false), 4000);
			onSuccess?.();
		});
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Adauga rezultate laborator</CardTitle>
				<CardDescription>
					Introduceti valorile analizelor pentru pacient.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{submitted && (
					<div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
						Rezultatele au fost salvate cu succes.
					</div>
				)}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="date">Data recoltarii</Label>
						<Input
							id="date"
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-3">
						{rows.map((row, i) => (
							<div
								key={row.id}
								className="grid grid-cols-[1fr_80px_80px_80px_80px_auto] items-end gap-2"
							>
								{i === 0 && (
									<>
										<Label className="text-xs">Parametru</Label>
										<Label className="text-xs">Valoare</Label>
										<Label className="text-xs">Unitate</Label>
										<Label className="text-xs">Ref min</Label>
										<Label className="text-xs">Ref max</Label>
										<span />
									</>
								)}
								<Input
									placeholder="ex: ALT"
									value={row.name}
									onChange={(e) =>
										setRows((prev) =>
											prev.map((r) =>
												r.id === row.id ? { ...r, name: e.target.value } : r,
											),
										)
									}
									required
								/>
								<Input
									placeholder="42"
									value={row.value}
									onChange={(e) =>
										setRows((prev) =>
											prev.map((r) =>
												r.id === row.id ? { ...r, value: e.target.value } : r,
											),
										)
									}
									required
								/>
								<Input
									placeholder="U/L"
									value={row.unit}
									onChange={(e) =>
										setRows((prev) =>
											prev.map((r) =>
												r.id === row.id ? { ...r, unit: e.target.value } : r,
											),
										)
									}
									required
								/>
								<Input
									placeholder="0"
									value={row.refMin}
									onChange={(e) =>
										setRows((prev) =>
											prev.map((r) =>
												r.id === row.id ? { ...r, refMin: e.target.value } : r,
											),
										)
									}
									required
								/>
								<Input
									placeholder="40"
									value={row.refMax}
									onChange={(e) =>
										setRows((prev) =>
											prev.map((r) =>
												r.id === row.id ? { ...r, refMax: e.target.value } : r,
											),
										)
									}
									required
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => removeRow(row.id)}
									disabled={rows.length === 1}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						))}
					</div>
					<div className="flex gap-2">
						<Button type="button" variant="outline" size="sm" onClick={addRow}>
							<Plus className="mr-1 h-4 w-4" /> Adauga parametru
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Se salveaza..." : "Salveaza rezultate"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
