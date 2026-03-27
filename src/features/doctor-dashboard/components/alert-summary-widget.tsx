import { AlertTriangle, Bell, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AlertItem {
	severity: "critical" | "warning" | "info";
	dismissed: boolean;
}

interface AlertSummaryWidgetProps {
	alerts: AlertItem[];
}

export function AlertSummaryWidget({ alerts }: AlertSummaryWidgetProps) {
	const active = alerts.filter((a) => !a.dismissed);
	const critical = active.filter((a) => a.severity === "critical").length;
	const warning = active.filter((a) => a.severity === "warning").length;
	const info = active.filter((a) => a.severity === "info").length;

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">Alerte active</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-3 gap-3">
					<div className="flex flex-col items-center gap-1 rounded-lg bg-destructive/10 p-3">
						<AlertTriangle className="h-5 w-5 text-destructive" />
						<span className="text-2xl font-bold text-destructive">
							{critical}
						</span>
						<span className="text-xs text-muted-foreground">Critice</span>
					</div>
					<div className="flex flex-col items-center gap-1 rounded-lg bg-orange-100 p-3 dark:bg-orange-950">
						<Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
						<span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
							{warning}
						</span>
						<span className="text-xs text-muted-foreground">Atentie</span>
					</div>
					<div className="flex flex-col items-center gap-1 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
						<Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
						<span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
							{info}
						</span>
						<span className="text-xs text-muted-foreground">Info</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
