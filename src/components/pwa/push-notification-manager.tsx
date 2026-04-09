"use client";

import { Button } from "@/components/ui/button";
import { X, Bell } from "lucide-react";

const ROLE_MESSAGES: Record<string, string> = {
	user: "Primește alerte importante de la medicul tău",
	doctor: "Primește alerte instant când un pacient raportează valori critice",
	admin: "Activează notificările pentru alerte de sistem",
};

interface PushPromptBannerProps {
	role: string;
	isLoading: boolean;
	onAccept: () => void;
	onDismiss: () => void;
}

export function PushPromptBanner({
	role,
	isLoading,
	onAccept,
	onDismiss,
}: PushPromptBannerProps) {
	return (
		<div className="border-b bg-muted/50 px-4 py-2 flex items-center justify-between gap-3 text-sm animate-in slide-in-from-top-2 duration-300">
			<div className="flex items-center gap-2 min-w-0">
				<Bell className="h-4 w-4 shrink-0 text-muted-foreground" />
				<p className="text-muted-foreground truncate">
					{ROLE_MESSAGES[role] ?? ROLE_MESSAGES.user}
				</p>
			</div>
			<div className="flex items-center gap-2 shrink-0">
				<Button
					size="sm"
					variant="default"
					onClick={onAccept}
					disabled={isLoading}
				>
					{isLoading ? "Se procesează..." : "Activează"}
				</Button>
				<Button
					size="icon"
					variant="ghost"
					className="h-7 w-7"
					onClick={onDismiss}
				>
					<X className="h-4 w-4" />
					<span className="sr-only">Închide</span>
				</Button>
			</div>
		</div>
	);
}
