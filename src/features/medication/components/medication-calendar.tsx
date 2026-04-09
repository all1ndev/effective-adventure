import { Lock } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { type Medication, type MedicationLog } from "../data/schema";
import {
	isMedicationDueOnDate,
	getDailyDoseCount,
} from "../lib/medication-schedule";

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
		label: "Întârziat",
		className:
			"bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
	},
};

export function MedicationCalendar({
	medications,
	logs,
}: MedicationCalendarProps) {
	const now = new Date();
	const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
	const todayLogs = logs.filter((l) => l.takenAt.startsWith(today));

	return (
		<Card>
			<CardHeader>
				<CardTitle>Schema de medicație — Astăzi</CardTitle>
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
					{medications
						.filter((m) => isMedicationDueOnDate(m, today))
						.map((med) => {
							const medLogs = todayLogs.filter(
								(l) => l.medicationId === med.id,
							);
							const dailyDoses = getDailyDoseCount(med.frequency);
							const remaining = dailyDoses - medLogs.length;

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
										{med.notes && (
											<p className="text-xs text-blue-600 dark:text-blue-400">
												📋 {med.notes}
											</p>
										)}
										{med.endDate && (
											<p className="text-xs text-orange-600 dark:text-orange-400">
												Expiră: {med.endDate}
											</p>
										)}
									</div>
									<div className="flex flex-col items-end gap-1">
										{medLogs.length > 0 ? (
											<>
												{medLogs.map((log, i) => {
													const config = statusConfig[log.status];
													return (
														<span
															key={log.id}
															className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
														>
															{dailyDoses > 1
																? `Doza ${i + 1}: ${config.label}`
																: config.label}{" "}
															{new Date(log.takenAt).toLocaleTimeString(
																"ro-RO",
																{
																	hour: "2-digit",
																	minute: "2-digit",
																},
															)}
														</span>
													);
												})}
												{remaining > 0 && (
													<span className="text-xs text-muted-foreground">
														{remaining}{" "}
														{remaining === 1 ? "doză rămasă" : "doze rămase"}
													</span>
												)}
											</>
										) : (
											<span className="text-xs text-muted-foreground">
												Neînregistrat ({dailyDoses}{" "}
												{dailyDoses === 1 ? "doză" : "doze"})
											</span>
										)}
									</div>
								</div>
							);
						})}

					{medications
						.filter(
							(m) => m.startDate <= today && !isMedicationDueOnDate(m, today),
						)
						.map((med) => (
							<div
								key={med.id}
								className="flex items-center justify-between rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-3 opacity-60"
							>
								<div>
									<p className="font-medium">{med.name}</p>
									<p className="text-sm text-muted-foreground">
										{med.dose} — {med.frequency}
									</p>
								</div>
								<span className="text-xs text-muted-foreground">
									Nu este programat astăzi
								</span>
							</div>
						))}

					{medications
						.filter((m) => m.startDate > today)
						.map((med) => (
							<div
								key={med.id}
								className="flex items-center justify-between rounded-lg border border-dashed p-3 opacity-60"
							>
								<div>
									<p className="font-medium">{med.name}</p>
									<p className="text-sm text-muted-foreground">
										{med.dose} — {med.frequency}
									</p>
								</div>
								<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
									<Lock className="h-3 w-3" />
									<span>
										Din{" "}
										{new Date(med.startDate).toLocaleDateString("ro-RO", {
											day: "numeric",
											month: "short",
										})}
									</span>
								</div>
							</div>
						))}
				</div>
			</CardContent>
		</Card>
	);
}
