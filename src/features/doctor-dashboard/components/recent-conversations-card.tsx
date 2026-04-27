"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ConversationItem {
	id: string;
	patientId: string;
	patientName: string;
	lastMessage: string;
	lastMessageAt: Date;
	unreadCount: number;
}

interface RecentConversationsCardProps {
	conversations: ConversationItem[];
}

const rtf = new Intl.RelativeTimeFormat("ro", { numeric: "auto" });

function relativeTime(date: Date) {
	const now = Date.now();
	const diffMs = date.getTime() - now;
	const diffMin = Math.round(diffMs / 60000);
	if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
	const diffH = Math.round(diffMin / 60);
	if (Math.abs(diffH) < 24) return rtf.format(diffH, "hour");
	const diffD = Math.round(diffH / 24);
	return rtf.format(diffD, "day");
}

export function RecentConversationsCard({
	conversations,
}: RecentConversationsCardProps) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<MessageSquare className="h-4 w-4" />
					Conversații recente
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				{conversations.length === 0 ? (
					<p className="py-4 text-center text-xs text-muted-foreground">
						Nicio conversație recentă.
					</p>
				) : (
					conversations.map((c) => (
						<Link
							key={c.id}
							href="/messaging"
							className="flex items-start justify-between gap-2 rounded-md p-2 transition-colors hover:bg-accent"
						>
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2">
									<p className="truncate text-sm font-medium">
										{c.patientName}
									</p>
									{c.unreadCount > 0 && (
										<Badge variant="default" className="h-5 px-1.5 text-[10px]">
											{c.unreadCount}
										</Badge>
									)}
								</div>
								<p className="truncate text-xs text-muted-foreground">
									{c.lastMessage || "—"}
								</p>
							</div>
							<span className="shrink-0 text-[10px] text-muted-foreground">
								{relativeTime(new Date(c.lastMessageAt))}
							</span>
						</Link>
					))
				)}
			</CardContent>
		</Card>
	);
}
