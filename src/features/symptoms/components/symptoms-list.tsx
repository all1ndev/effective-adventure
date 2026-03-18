import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type SymptomReport } from "../data/schema";

interface SymptomsListProps {
	data: SymptomReport[];
}

const severityConfig = {
	usoara: { label: "Usoara", variant: "outline" as const },
	moderata: { label: "Moderata", variant: "secondary" as const },
	severa: { label: "Severa", variant: "destructive" as const },
};

export function SymptomsList({ data }: SymptomsListProps) {
	return (
		<div className="space-y-3">
			{data.map((report) => {
				const config = severityConfig[report.severity];
				return (
					<Card key={report.id}>
						<CardHeader className="pb-2">
							<div className="flex items-center justify-between">
								<CardTitle className="text-sm font-medium">
									{report.date}
								</CardTitle>
								<Badge variant={config.variant}>{config.label}</Badge>
							</div>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-1.5">
								{report.symptoms.map((s) => (
									<Badge key={s} variant="secondary" className="text-xs">
										{s}
									</Badge>
								))}
							</div>
							{report.notes && (
								<p className="mt-2 text-sm text-muted-foreground">
									{report.notes}
								</p>
							)}
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
