import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PatientSummary {
	id: string;
	name: string;
	age?: number;
	transplantDate?: string;
	status: "activ" | "inactiv";
	activeAlerts: number;
	complianceRate: number;
}

interface PatientOverviewCardProps {
	patient: PatientSummary;
}

function getHealthStatus(patient: PatientSummary) {
	if (patient.activeAlerts > 0 && patient.complianceRate < 70) {
		return { icon: XCircle, color: "text-destructive", label: "Critic" };
	}
	if (patient.activeAlerts > 0 || patient.complianceRate < 90) {
		return {
			icon: AlertTriangle,
			color: "text-orange-500 dark:text-orange-400",
			label: "Atentie",
		};
	}
	return {
		icon: CheckCircle,
		color: "text-green-600 dark:text-green-400",
		label: "Bun",
	};
}

export function PatientOverviewCard({ patient }: PatientOverviewCardProps) {
	const health = getHealthStatus(patient);
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
				<div className="grid grid-cols-2 gap-3 text-center">
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
				</div>
			</CardContent>
		</Card>
	);
}
