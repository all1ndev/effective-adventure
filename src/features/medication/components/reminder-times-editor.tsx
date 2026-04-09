"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { getDailyDoseCount } from "../lib/medication-schedule";
import { getMedicationReminders, upsertMedicationReminders } from "../actions";

interface ReminderEntry {
	doseIndex: number;
	time: string;
	enabled: boolean;
}

interface ReminderTimesEditorProps {
	medicationId: string;
	frequency: string;
}

const DEFAULT_DOSE_TIMES = ["08:00", "14:00", "20:00", "23:00"];

export function ReminderTimesEditor({
	medicationId,
	frequency,
}: ReminderTimesEditorProps) {
	const doseCount = getDailyDoseCount(frequency);
	const [entries, setEntries] = useState<ReminderEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		getMedicationReminders(medicationId)
			.then((reminders) => {
				const mapped: ReminderEntry[] = [];
				for (let i = 0; i < doseCount; i++) {
					const existing = reminders.find((r) => r.doseIndex === i);
					mapped.push({
						doseIndex: i,
						time: existing?.time ?? DEFAULT_DOSE_TIMES[i] ?? "08:00",
						enabled: existing?.enabled ?? false,
					});
				}
				setEntries(mapped);
			})
			.catch(() => {
				// Fallback to defaults
				setEntries(
					Array.from({ length: doseCount }, (_, i) => ({
						doseIndex: i,
						time: DEFAULT_DOSE_TIMES[i] ?? "08:00",
						enabled: false,
					})),
				);
			})
			.finally(() => setLoading(false));
	}, [medicationId, doseCount]);

	function updateEntry(
		doseIndex: number,
		field: "time" | "enabled",
		value: string | boolean,
	) {
		setEntries((prev) =>
			prev.map((e) =>
				e.doseIndex === doseIndex ? { ...e, [field]: value } : e,
			),
		);
	}

	function handleSave() {
		startTransition(async () => {
			const result = await upsertMedicationReminders(medicationId, entries);
			if (result.error) {
				toast.error(result.error);
				return;
			}
			toast.success("Reminder-ele au fost salvate.");
		});
	}

	if (loading) {
		return (
			<p className="text-sm text-muted-foreground">
				Se încarcă reminder-ele...
			</p>
		);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-sm font-medium">
				<Bell className="h-4 w-4" />
				Notificări de administrare
			</div>
			<p className="text-xs text-muted-foreground">
				Setează ora la care vrei să primești notificare pentru fiecare doză.
				Dacă nu confirmi doza în 30 de minute, vei primi o reamintire.
			</p>

			<div className="space-y-2">
				{entries.map((entry) => (
					<div
						key={entry.doseIndex}
						className="flex items-center gap-3 rounded-md border p-3"
					>
						<div className="flex-1">
							<Label
								htmlFor={`reminder-time-${entry.doseIndex}`}
								className="text-sm"
							>
								{doseCount > 1
									? `Doza ${entry.doseIndex + 1}/${doseCount}`
									: "Ora notificării"}
							</Label>
							<Input
								id={`reminder-time-${entry.doseIndex}`}
								type="time"
								value={entry.time}
								onChange={(e) =>
									updateEntry(entry.doseIndex, "time", e.target.value)
								}
								className="mt-1 w-32"
							/>
						</div>
						<div className="flex flex-col items-center gap-1">
							{entry.enabled ? (
								<Bell className="h-4 w-4 text-primary" />
							) : (
								<BellOff className="h-4 w-4 text-muted-foreground" />
							)}
							<Switch
								checked={entry.enabled}
								onCheckedChange={(checked) =>
									updateEntry(entry.doseIndex, "enabled", checked)
								}
							/>
						</div>
					</div>
				))}
			</div>

			<Button type="button" size="sm" onClick={handleSave} disabled={isPending}>
				{isPending ? "Se salvează..." : "Salvează reminder-ele"}
			</Button>
		</div>
	);
}
