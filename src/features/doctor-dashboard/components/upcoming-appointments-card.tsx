"use client";

import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AppointmentItem {
	id: string;
	title: string;
	message: string;
	scheduledAt: Date | null;
	targetType: string;
}

interface UpcomingAppointmentsCardProps {
	appointments: AppointmentItem[];
}

const dateFmt = new Intl.DateTimeFormat("ro-RO", {
	weekday: "short",
	day: "numeric",
	month: "short",
	hour: "2-digit",
	minute: "2-digit",
});

const targetLabels: Record<string, string> = {
	patient: "Pacient",
	group: "Grup",
	medication: "Medicație",
	category: "Categorie",
	compliance: "Complianță",
	all: "Toți",
	doctor: "Medic",
	etiology: "Etiologie",
};

export function UpcomingAppointmentsCard({
	appointments,
}: UpcomingAppointmentsCardProps) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<CalendarClock className="h-4 w-4" />
					Programări apropiate
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				{appointments.length === 0 ? (
					<p className="py-4 text-center text-xs text-muted-foreground">
						Nicio programare în următoarele 7 zile.
					</p>
				) : (
					appointments.map((a) => (
						<Link
							key={a.id}
							href="/calendar"
							className="flex items-start justify-between gap-2 rounded-md p-2 transition-colors hover:bg-accent"
						>
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-medium">{a.title}</p>
								<p className="truncate text-xs text-muted-foreground">
									{a.message}
								</p>
							</div>
							<div className="flex shrink-0 flex-col items-end gap-1">
								<span className="text-[10px] text-muted-foreground">
									{a.scheduledAt
										? dateFmt.format(new Date(a.scheduledAt))
										: "—"}
								</span>
								<Badge variant="outline" className="text-[10px]">
									{targetLabels[a.targetType] ?? a.targetType}
								</Badge>
							</div>
						</Link>
					))
				)}
			</CardContent>
		</Card>
	);
}
