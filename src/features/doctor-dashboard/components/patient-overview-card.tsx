import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type PatientSummary } from "../data/summary";

interface PatientOverviewCardProps {
	patient: PatientSummary;
}

const statusConfig = {
	bun: {
		icon: CheckCircle,
		color: "text-green-600 dark:text-green-400",
		label: "Bun",
	},
	atentie: {
		icon: AlertTriangle,
		color: "text-orange-500 dark:text-orange-400",
		label: "Atentie",
	},
	critic: { icon: XCircle, color: "text-destructive", label: "Critic" },
};

export function PatientOverviewCard({ patient }: PatientOverviewCardProps) {
	const health = statusConfig[patient.healthStatus];
	const Icon = health.icon;

	return (
		<Card className="transition-shadow hover:shadow-md">
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between gap-2">
					<CardTitle className="text-base">{patient.name}</CardTitle>
					<div
						className={`flex items-center gap-1 text-sm font-medium ${health.color}`}
					>
						<Icon className="h-4 w-4" />
						<span>{health.label}</span>
					</div>
				</div>
				<div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
					{patient.age && <span>{patient.age} ani</span>}
					{patient.transplantDate && (
						<span>· Transplant: {patient.transplantDate}</span>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-3 gap-3 text-center">
					<div className="rounded-md bg-muted p-2">
						<p className="text-lg font-bold">{patient.activeAlerts}</p>
						<p className="text-xs text-muted-foreground">Alerte</p>
					</div>
					<div className="rounded-md bg-muted p-2">
						<p
							className={`text-lg font-bold ${patient.complianceRate >= 90 ? "text-green-600" : patient.complianceRate >= 70 ? "text-orange-500" : "text-destructive"}`}
						>
							{patient.complianceRate}%
						</p>
						<p className="text-xs text-muted-foreground">Conformitate</p>
					</div>
					<div className="rounded-md bg-muted p-2">
						<p className="text-xs font-medium">{patient.lastVisit}</p>
						<p className="text-xs text-muted-foreground">Ultima vizita</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
