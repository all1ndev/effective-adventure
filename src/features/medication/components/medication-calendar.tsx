import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { type Medication, type MedicationLog } from "../data/schema";

interface MedicationCalendarProps {
	medications: Medication[];
	logs: MedicationLog[];
}

const statusConfig = {
	luat: {
		label: "Luat",
		className:
			"bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
	},
	omis: {
		label: "Omis",
		className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
	},
	intarziat: {
		label: "Intarziat",
		className:
			"bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
	},
};

export function MedicationCalendar({
	medications,
	logs,
}: MedicationCalendarProps) {
	const today = new Date().toISOString().split("T")[0];
	const todayLogs = logs.filter((l) => l.takenAt.startsWith(today));

	return (
		<Card>
			<CardHeader>
				<CardTitle>Schema de medicatie — Astazi</CardTitle>
				<CardDescription>
					{new Date().toLocaleDateString("ro-RO", {
						weekday: "long",
						day: "numeric",
						month: "long",
						year: "numeric",
					})}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{medications.map((med) => {
						const medLogs = todayLogs.filter((l) => l.medicationId === med.id);
						return (
							<div
								key={med.id}
								className="flex items-center justify-between rounded-lg border p-3"
							>
								<div>
									<p className="font-medium">{med.name}</p>
									<p className="text-sm text-muted-foreground">
										{med.dose} — {med.frequency}
									</p>
									{med.endDate && (
										<p className="text-xs text-orange-600 dark:text-orange-400">
											Expira: {med.endDate}
										</p>
									)}
								</div>
								<div className="flex flex-col items-end gap-1">
									{medLogs.length > 0 ? (
										medLogs.map((log) => {
											const config = statusConfig[log.status];
											return (
												<span
													key={log.id}
													className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
												>
													{config.label}{" "}
													{new Date(log.takenAt).toLocaleTimeString("ro-RO", {
														hour: "2-digit",
														minute: "2-digit",
													})}
												</span>
											);
										})
									) : (
										<span className="text-xs text-muted-foreground">
											Neinregistrat
										</span>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
