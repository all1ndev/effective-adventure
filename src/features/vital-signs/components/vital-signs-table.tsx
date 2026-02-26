import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type VitalEntry } from "../data/schema";

interface VitalSignsTableProps {
	data: VitalEntry[];
}

export function VitalSignsTable({ data }: VitalSignsTableProps) {
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
						</TableRow>
					</TableHeader>
					<TableBody>
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
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
