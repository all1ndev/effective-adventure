import Link from "next/link";
import { AlertTriangle, Bell, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AlertItem {
	id?: string;
	patientName?: string;
	type?: "vital" | "simptom" | "laborator" | "medicatie";
	message?: string;
	severity: "critical" | "warning" | "info";
	dismissed: boolean;
	createdAt?: Date | string;
}

interface AlertSummaryWidgetProps {
	alerts: AlertItem[];
}

const typeLabels: Record<string, string> = {
	vital: "Semne vitale",
	simptom: "Simptome",
	laborator: "Laborator",
	medicatie: "Medicație",
};

const rtf = new Intl.RelativeTimeFormat("ro", { numeric: "auto" });
function relativeTime(date: Date) {
	const diffMin = Math.round((date.getTime() - Date.now()) / 60000);
	if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
	const diffH = Math.round(diffMin / 60);
	if (Math.abs(diffH) < 24) return rtf.format(diffH, "hour");
	return rtf.format(Math.round(diffH / 24), "day");
}

const severityRank = { critical: 0, warning: 1, info: 2 } as const;

export function AlertSummaryWidget({ alerts }: AlertSummaryWidgetProps) {
	const active = alerts.filter((a) => !a.dismissed);
	const critical = active.filter((a) => a.severity === "critical").length;
	const warning = active.filter((a) => a.severity === "warning").length;
	const info = active.filter((a) => a.severity === "info").length;

	const recent = [...active]
		.sort((a, b) => {
			const sev = severityRank[a.severity] - severityRank[b.severity];
			if (sev !== 0) return sev;
			const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
			const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
			return tb - ta;
		})
		.slice(0, 3);

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">Alerte active</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
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
						<span className="text-xs text-muted-foreground">Atenție</span>
					</div>
					<div className="flex flex-col items-center gap-1 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
						<Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
						<span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
							{info}
						</span>
						<span className="text-xs text-muted-foreground">Info</span>
					</div>
				</div>

				{recent.length > 0 && (
					<div className="space-y-1.5 border-t pt-2">
						<p className="text-xs font-medium text-muted-foreground">
							Cele mai recente
						</p>
						{recent.map((a, i) => {
							const dotColor =
								a.severity === "critical"
									? "bg-destructive"
									: a.severity === "warning"
										? "bg-orange-500"
										: "bg-blue-500";
							return (
								<div
									key={a.id ?? i}
									className="flex items-start gap-2 rounded-md p-1.5 text-xs"
								>
									<span
										className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dotColor}`}
									/>
									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between gap-2">
											<p className="truncate font-medium">{a.patientName}</p>
											{a.createdAt && (
												<span className="shrink-0 text-[10px] text-muted-foreground">
													{relativeTime(new Date(a.createdAt))}
												</span>
											)}
										</div>
										<p className="truncate text-muted-foreground">
											{a.type ? `${typeLabels[a.type]} · ` : ""}
											{a.message}
										</p>
									</div>
								</div>
							);
						})}
						<Link
							href="/alerts"
							className="block pt-1 text-center text-xs text-primary hover:underline"
						>
							Vezi toate alertele
						</Link>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
