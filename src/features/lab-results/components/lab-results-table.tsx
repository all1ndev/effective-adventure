import { FileDown } from "lucide-react";
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
import { type LabResult } from "../data/schema";

interface LabResultsTableProps {
	result: LabResult;
}

export function LabResultsTable({ result }: LabResultsTableProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-base">Analize din {result.date}</CardTitle>
				{result.pdfFileName && (
					<Button variant="outline" size="sm" asChild>
						<a
							href={`/api/files/lab-results/${result.pdfFileName}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							<FileDown className="mr-1 h-4 w-4" />
							Descarcă PDF
						</a>
					</Button>
				)}
			</CardHeader>
			<CardContent>
				{result.tests.length > 0 ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Parametru</TableHead>
								<TableHead className="text-right">Valoare</TableHead>
								<TableHead className="text-right">Interval referință</TableHead>
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
												className={
													isAbnormal ? "font-bold text-destructive" : ""
												}
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
				) : (
					<p className="text-muted-foreground text-sm">
						Rezultatele sunt disponibile doar în format PDF.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
