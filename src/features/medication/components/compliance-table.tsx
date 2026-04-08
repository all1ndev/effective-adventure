"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
	type Medication,
	type MedicationLog,
	categoryOptions,
} from "../data/schema";
import { EditMedicationDialog } from "./edit-medication-dialog";

interface ComplianceTableProps {
	medications: Medication[];
	logs: MedicationLog[];
	patientId?: string;
	onUpdate?: () => void;
	category?: string;
}

const categoryLabelMap = Object.fromEntries(
	categoryOptions.map((c) => [c.value, c.label]),
);

export function ComplianceTable({
	medications,
	logs,
	patientId,
	onUpdate,
	category,
}: ComplianceTableProps) {
	const [editingMed, setEditingMed] = useState<Medication | null>(null);

	const filtered = category
		? medications.filter((m) => (m.category ?? "altele") === category)
		: medications;

	const stats = filtered.map((med) => {
		const medLogs = logs.filter((l) => l.medicationId === med.id);
		const taken = medLogs.filter((l) => l.status === "luat").length;
		const total = medLogs.length;
		const rate = total > 0 ? Math.round((taken / total) * 100) : 0;
		return { med, taken, total, rate };
	});

	if (filtered.length === 0) {
		return null;
	}

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Conformitate medicație</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Medicament</TableHead>
								<TableHead>Doză</TableHead>
								<TableHead>Frecvență</TableHead>
								<TableHead>Notițe</TableHead>
								<TableHead className="text-right">Conformitate</TableHead>
								{patientId && <TableHead className="w-10" />}
							</TableRow>
						</TableHeader>
						<TableBody>
							{stats.map(({ med, taken, total, rate }) => (
								<TableRow key={med.id}>
									<TableCell>
										<div className="flex items-center gap-2">
											<span className="font-medium">{med.name}</span>
											{!category && med.category && (
												<Badge variant="secondary" className="text-[10px]">
													{categoryLabelMap[med.category] ?? med.category}
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell>{med.dose}</TableCell>
									<TableCell>{med.frequency}</TableCell>
									<TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
										{med.notes || "—"}
									</TableCell>
									<TableCell className="text-right">
										<span
											className={
												rate >= 90
													? "text-green-600 dark:text-green-400"
													: rate >= 70
														? "text-orange-600 dark:text-orange-400"
														: "font-semibold text-destructive"
											}
										>
											{total > 0 ? `${rate}% (${taken}/${total})` : "—"}
										</span>
									</TableCell>
									{patientId && (
										<TableCell>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => setEditingMed(med)}
											>
												<Pencil className="h-4 w-4" />
												<span className="sr-only">Editează</span>
											</Button>
										</TableCell>
									)}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
			<EditMedicationDialog
				medication={editingMed}
				open={editingMed !== null}
				onOpenChange={(open) => {
					if (!open) setEditingMed(null);
				}}
				patientId={patientId}
				onSuccess={onUpdate}
			/>
		</>
	);
}
