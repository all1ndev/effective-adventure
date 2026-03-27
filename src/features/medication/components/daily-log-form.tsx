"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { type Medication, type MedicationLog } from "../data/schema";
import { createMedicationLogsBatch } from "../actions";

interface DailyLogFormProps {
	medications: Medication[];
	logs: MedicationLog[];
	onSuccess?: () => void;
}

type LogEntry = {
	medicationId: string;
	status: "luat" | "omis" | "intarziat" | "";
	time: string;
};

const statusOptions = [
	{ value: "luat", label: "Luat" },
	{ value: "omis", label: "Omis" },
	{ value: "intarziat", label: "Întârziat" },
];

export function DailyLogForm({
	medications,
	logs,
	onSuccess,
}: DailyLogFormProps) {
	const today = new Date().toISOString().split("T")[0];
	const todayLogs = logs.filter((l) => l.takenAt.startsWith(today));

	const alreadyLoggedIds = new Set(todayLogs.map((l) => l.medicationId));

	const unloggedMedications = medications.filter(
		(m) => !alreadyLoggedIds.has(m.id),
	);

	const [entries, setEntries] = useState<LogEntry[]>(
		medications.map((m) => ({
			medicationId: m.id,
			status: alreadyLoggedIds.has(m.id)
				? (todayLogs.find((l) => l.medicationId === m.id)?.status ?? "")
				: "",
			time: alreadyLoggedIds.has(m.id)
				? new Date(
						todayLogs.find((l) => l.medicationId === m.id)!.takenAt,
					).toLocaleTimeString("ro-RO", {
						hour: "2-digit",
						minute: "2-digit",
					})
				: new Date().toLocaleTimeString("ro-RO", {
						hour: "2-digit",
						minute: "2-digit",
					}),
		})),
	);
	const [notes, setNotes] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [isPending, startTransition] = useTransition();

	function updateEntry(
		medicationId: string,
		field: "status" | "time",
		value: string,
	) {
		setEntries((prev) =>
			prev.map((e) =>
				e.medicationId === medicationId ? { ...e, [field]: value } : e,
			),
		);
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const newEntries = entries.filter(
			(entry) =>
				entry.status !== "" && !alreadyLoggedIds.has(entry.medicationId),
		);

		if (newEntries.length === 0) return;

		const logValues = newEntries.map((entry) => ({
			medicationId: entry.medicationId,
			status: entry.status as "luat" | "omis" | "intarziat",
			takenAt: `${today}T${entry.time}:00`,
		}));

		startTransition(async () => {
			const result = await createMedicationLogsBatch(logValues);
			if (result.error) {
				toast.error(result.error);
				return;
			}
			setSubmitted(true);
			setTimeout(() => setSubmitted(false), 3000);
			onSuccess?.();
		});
	}

	const hasUnlogged = unloggedMedications.length > 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Jurnal zilnic de medicație</CardTitle>
				<CardDescription>
					Înregistrează medicamentele luate astăzi,{" "}
					{new Date().toLocaleDateString("ro-RO", {
						day: "numeric",
						month: "long",
						year: "numeric",
					})}
					.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{submitted && (
					<div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
						Jurnalul de astăzi a fost salvat cu succes.
					</div>
				)}

				{!hasUnlogged && !submitted && (
					<p className="text-sm text-muted-foreground">
						Toate medicamentele de astăzi au fost deja înregistrate.
					</p>
				)}

				{hasUnlogged && (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-3">
							{medications.map((med) => {
								const entry = entries.find((e) => e.medicationId === med.id);
								const isLogged = alreadyLoggedIds.has(med.id);

								return (
									<div
										key={med.id}
										className={`rounded-lg border p-4 ${
											isLogged
												? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30"
												: ""
										}`}
									>
										<div className="mb-3">
											<p className="font-medium">{med.name}</p>
											<p className="text-sm text-muted-foreground">
												{med.dose} — {med.frequency}
											</p>
										</div>

										{isLogged ? (
											<p className="text-sm text-green-700 dark:text-green-400">
												Deja înregistrat astăzi
											</p>
										) : (
											<div className="grid gap-3 sm:grid-cols-2">
												<div className="space-y-1.5">
													<Label htmlFor={`status-${med.id}`}>Status</Label>
													<Select
														value={entry?.status ?? ""}
														onValueChange={(v) =>
															updateEntry(med.id, "status", v)
														}
														required
													>
														<SelectTrigger
															id={`status-${med.id}`}
															className="w-full"
														>
															<SelectValue placeholder="Selectează status" />
														</SelectTrigger>
														<SelectContent>
															{statusOptions.map((opt) => (
																<SelectItem key={opt.value} value={opt.value}>
																	{opt.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
												<div className="space-y-1.5">
													<Label htmlFor={`time-${med.id}`}>Ora</Label>
													<Input
														id={`time-${med.id}`}
														type="time"
														value={entry?.time ?? ""}
														onChange={(e) =>
															updateEntry(med.id, "time", e.target.value)
														}
													/>
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="notes">Observații (opțional)</Label>
							<Textarea
								id="notes"
								placeholder="ex: Am luat Tacrolimus cu 30 de minute întârziere din cauza..."
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								rows={3}
							/>
						</div>

						<Button
							type="submit"
							disabled={
								isPending ||
								entries.filter(
									(e) =>
										e.status !== "" && !alreadyLoggedIds.has(e.medicationId),
								).length === 0
							}
						>
							{isPending ? "Se salvează..." : "Salvează jurnalul de astăzi"}
						</Button>
					</form>
				)}
			</CardContent>
		</Card>
	);
}
