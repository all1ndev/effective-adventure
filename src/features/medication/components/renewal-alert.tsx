import { AlertTriangle } from "lucide-react";
import { type Medication } from "../data/schema";

interface RenewalAlertProps {
	medications: Medication[];
}

export function RenewalAlert({ medications }: RenewalAlertProps) {
	const today = new Date();
	const thirtyDaysFromNow = new Date(
		today.getTime() + 30 * 24 * 60 * 60 * 1000,
	);

	const expiring = medications.filter((m) => {
		if (!m.endDate) return false;
		const end = new Date(m.endDate);
		return end <= thirtyDaysFromNow;
	});

	if (expiring.length === 0) return null;

	return (
		<div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950">
			<div className="flex items-center gap-2">
				<AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
				<h3 className="font-medium text-orange-800 dark:text-orange-200">
					Prescriptii ce expira curand
				</h3>
			</div>
			<ul className="mt-2 space-y-1">
				{expiring.map((m) => (
					<li
						key={m.id}
						className="text-sm text-orange-700 dark:text-orange-300"
					>
						<strong>{m.name}</strong> ({m.dose}) — expira {m.endDate}
					</li>
				))}
			</ul>
		</div>
	);
}
