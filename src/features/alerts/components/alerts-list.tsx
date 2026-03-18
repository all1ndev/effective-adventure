"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Alert } from "../data/schema";
import { AlertBadge } from "./alert-badge";

interface AlertsListProps {
	data: Alert[];
}

export function AlertsList({ data }: AlertsListProps) {
	const [dismissed, setDismissed] = useState<string[]>(
		data.filter((a) => a.dismissed).map((a) => a.id),
	);

	const active = data
		.filter((a) => !dismissed.includes(a.id))
		.sort((a, b) => {
			const order = { critical: 0, warning: 1, info: 2 };
			return order[a.severity] - order[b.severity];
		});

	const dismissedAlerts = data.filter((a) => dismissed.includes(a.id));

	return (
		<div className="space-y-6">
			{active.length === 0 && (
				<p className="text-sm text-muted-foreground">Nicio alerta activa.</p>
			)}
			<div className="space-y-3">
				{active.map((alert) => (
					<Card
						key={alert.id}
						className="border-l-4"
						style={{
							borderLeftColor:
								alert.severity === "critical"
									? "hsl(var(--destructive))"
									: alert.severity === "warning"
										? "#f97316"
										: "#3b82f6",
						}}
					>
						<CardContent className="flex items-start justify-between gap-4 pt-4">
							<div className="space-y-1">
								<div className="flex flex-wrap items-center gap-2">
									<AlertBadge severity={alert.severity} />
									<span className="text-sm font-medium">
										{alert.patientName}
									</span>
									<span className="text-xs text-muted-foreground">
										{new Date(alert.createdAt).toLocaleString("ro-RO")}
									</span>
								</div>
								<p className="text-sm">{alert.message}</p>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="shrink-0"
								onClick={() => setDismissed((prev) => [...prev, alert.id])}
							>
								<X className="h-4 w-4" />
								<span className="sr-only">Respinge</span>
							</Button>
						</CardContent>
					</Card>
				))}
			</div>
			{dismissedAlerts.length > 0 && (
				<div>
					<p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
						Respinse ({dismissedAlerts.length})
					</p>
					<div className="space-y-2 opacity-50">
						{dismissedAlerts.map((alert) => (
							<Card key={alert.id}>
								<CardContent className="flex items-center justify-between gap-4 py-3">
									<div className="flex flex-wrap items-center gap-2">
										<AlertBadge severity={alert.severity} />
										<span className="text-sm">{alert.patientName}</span>
									</div>
									<p className="text-xs text-muted-foreground">
										{alert.message}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
