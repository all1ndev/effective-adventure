import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type LabResult } from "../data/schema";

interface LabResultsTableProps {
	result: LabResult;
}

export function LabResultsTable({ result }: LabResultsTableProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Analize din {result.date}</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Parametru</TableHead>
							<TableHead className="text-right">Valoare</TableHead>
							<TableHead className="text-right">Interval referinta</TableHead>
							<TableHead className="text-right">Unitate</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{result.tests.map((test) => {
							const isAbnormal =
								test.value < test.refMin || test.value > test.refMax;
							return (
								<TableRow key={test.name}>
									<TableCell className="font-medium">{test.name}</TableCell>
									<TableCell className="text-right">
										<span
											className={isAbnormal ? "font-bold text-destructive" : ""}
										>
											{test.value}
											{isAbnormal && (
												<span className="ml-1 text-xs">
													{test.value > test.refMax ? "↑" : "↓"}
												</span>
											)}
										</span>
									</TableCell>
									<TableCell className="text-right text-sm text-muted-foreground">
										{test.refMin} – {test.refMax}
									</TableCell>
									<TableCell className="text-right text-sm text-muted-foreground">
										{test.unit}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
