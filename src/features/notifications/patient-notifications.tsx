"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { CheckCheck, Bell } from "lucide-react";
import { toast } from "sonner";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	getNotificationsForPatient,
	markNotificationAsRead,
	markAllNotificationsAsRead,
} from "./actions";

type Notification = Awaited<
	ReturnType<typeof getNotificationsForPatient>
>[number];

const severityConfig: Record<
	string,
	{ label: string; className: string; border: string }
> = {
	critical: {
		label: "Critic",
		className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
		border: "border-l-red-500",
	},
	warning: {
		label: "Atenție",
		className:
			"bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
		border: "border-l-orange-500",
	},
	info: {
		label: "Info",
		className: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
		border: "border-l-blue-500",
	},
};

export function PatientNotifications() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [isPending, startTransition] = useTransition();

	const fetchData = useCallback(() => {
		getNotificationsForPatient()
			.then(setNotifications)
			.catch(() => toast.error("Eroare la încărcarea notificărilor."))
			.finally(() => setLoading(false));
	}, []);

	useEffect(fetchData, [fetchData]);

	const unreadCount = notifications.filter((n) => !n.read).length;

	function handleMarkRead(id: string) {
		startTransition(async () => {
			await markNotificationAsRead(id);
			fetchData();
		});
	}

	function handleMarkAllRead() {
		startTransition(async () => {
			await markAllNotificationsAsRead();
			fetchData();
		});
	}

	return (
		<>
			<Header fixed>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					<ConfigDrawer />
				</div>
			</Header>

			<Main className="flex flex-1 flex-col gap-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">
							Notificări
							{unreadCount > 0 && (
								<Badge variant="destructive" className="ml-2 text-xs">
									{unreadCount} necitite
								</Badge>
							)}
						</h2>
						<p className="text-muted-foreground">
							Notificări de la echipa medicală.
						</p>
					</div>
					{unreadCount > 0 && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleMarkAllRead}
							disabled={isPending}
						>
							<CheckCheck className="mr-1.5 h-4 w-4" />
							Marchează toate ca citite
						</Button>
					)}
				</div>

				{loading ? (
					<div className="flex flex-1 items-center justify-center">
						<Spinner className="size-6" />
					</div>
				) : notifications.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<Bell className="mb-3 h-10 w-10 text-muted-foreground/50" />
							<p className="text-sm text-muted-foreground">
								Nu aveți notificări.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-3">
						{notifications.map((n) => {
							const sev = severityConfig[n.severity] ?? severityConfig.info;
							return (
								<Card
									key={n.id}
									className={`border-l-4 ${sev.border} ${n.read ? "opacity-60" : ""} transition-opacity`}
								>
									<CardContent className="p-4">
										<div className="flex items-start justify-between gap-3">
											<div className="flex-1 space-y-1">
												<div className="flex items-center gap-2">
													<p
														className={`font-medium ${!n.read ? "text-foreground" : "text-muted-foreground"}`}
													>
														{n.title}
													</p>
													<Badge className={sev.className}>{sev.label}</Badge>
													{!n.read && (
														<span className="h-2 w-2 rounded-full bg-blue-500" />
													)}
												</div>
												<p className="text-sm text-muted-foreground">
													{n.message}
												</p>
												<p className="text-xs text-muted-foreground">
													{n.createdByName} ·{" "}
													{new Date(n.createdAt).toLocaleDateString("ro-RO", {
														day: "numeric",
														month: "long",
														year: "numeric",
														hour: "2-digit",
														minute: "2-digit",
													})}
												</p>
											</div>
											{!n.read ? (
												<Button
													variant="outline"
													size="sm"
													disabled={isPending}
													onClick={() => handleMarkRead(n.id)}
												>
													<CheckCheck className="mr-1.5 h-3.5 w-3.5" />
													Confirm primire
												</Button>
											) : (
												<span className="shrink-0 text-xs text-green-600 dark:text-green-400">
													Confirmat
												</span>
											)}
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</Main>
		</>
	);
}
