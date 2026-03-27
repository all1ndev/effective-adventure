import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Medication, type MedicationLog } from "../data/schema";

interface ComplianceTableProps {
	medications: Medication[];
	logs: MedicationLog[];
}

export function ComplianceTable({ medications, logs }: ComplianceTableProps) {
	const stats = medications.map((med) => {
		const medLogs = logs.filter((l) => l.medicationId === med.id);
		const taken = medLogs.filter((l) => l.status === "luat").length;
		const total = medLogs.length;
		const rate = total > 0 ? Math.round((taken / total) * 100) : 0;
		return { med, taken, total, rate };
	});

	return (
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
							<TableHead className="text-right">Conformitate</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{stats.map(({ med, taken, total, rate }) => (
							<TableRow key={med.id}>
								<TableCell className="font-medium">{med.name}</TableCell>
								<TableCell>{med.dose}</TableCell>
								<TableCell>{med.frequency}</TableCell>
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
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
