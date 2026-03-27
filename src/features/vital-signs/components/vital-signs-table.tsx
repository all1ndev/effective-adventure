"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type VitalEntry } from "../data/schema";
import { deleteVitalSign } from "../actions";
import { VitalSignsForm } from "./vital-signs-form";

interface VitalSignsTableProps {
	data: VitalEntry[];
	onUpdate?: () => void;
}

export function VitalSignsTable({ data, onUpdate }: VitalSignsTableProps) {
	const [editingEntry, setEditingEntry] = useState<VitalEntry | null>(null);
	const [isPending, startTransition] = useTransition();

	function handleDelete(id: string) {
		startTransition(async () => {
			const result = await deleteVitalSign(id);
			if (result.error) {
				toast.error(result.error);
				return;
			}
			toast.success("Inregistrarea a fost stearsa.");
			onUpdate?.();
		});
	}

	if (editingEntry) {
		return (
			<VitalSignsForm
				editId={editingEntry.id}
				defaultValues={{
					systolic: editingEntry.systolic,
					diastolic: editingEntry.diastolic,
					temperature: editingEntry.temperature,
					pulse: editingEntry.pulse,
					weight: editingEntry.weight,
				}}
				onSuccess={() => {
					setEditingEntry(null);
					onUpdate?.();
				}}
			/>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Istoric semne vitale</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Data</TableHead>
							<TableHead>Tensiune (mmHg)</TableHead>
							<TableHead>Temperatura (°C)</TableHead>
							<TableHead>Puls (bpm)</TableHead>
							<TableHead>Greutate (kg)</TableHead>
							{onUpdate && <TableHead className="w-20">Actiuni</TableHead>}
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={onUpdate ? 6 : 5}
									className="text-center text-muted-foreground"
								>
									Nu exista inregistrari.
								</TableCell>
							</TableRow>
						)}
						{data.map((entry) => (
							<TableRow key={entry.id}>
								<TableCell>{entry.date}</TableCell>
								<TableCell>
									<span
										className={
											entry.systolic > 135 || entry.diastolic > 85
												? "font-semibold text-destructive"
												: ""
										}
									>
										{entry.systolic}/{entry.diastolic}
									</span>
								</TableCell>
								<TableCell>
									<span
										className={
											entry.temperature > 37.5
												? "font-semibold text-destructive"
												: ""
										}
									>
										{entry.temperature.toFixed(1)}
									</span>
								</TableCell>
								<TableCell>{entry.pulse}</TableCell>
								<TableCell>{entry.weight.toFixed(1)}</TableCell>
								{onUpdate && (
									<TableCell>
										<div className="flex gap-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => setEditingEntry(entry)}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-destructive hover:text-destructive"
												onClick={() => handleDelete(entry.id)}
												disabled={isPending}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								)}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
