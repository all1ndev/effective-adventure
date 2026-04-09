"use client";

import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

interface InstallPromptBannerProps {
	isIOS: boolean;
	onAccept: () => void;
	onDismiss: () => void;
}

export function InstallPromptBanner({
	isIOS,
	onAccept,
	onDismiss,
}: InstallPromptBannerProps) {
	return (
		<div className="border-b bg-muted/50 px-4 py-2 flex items-center justify-between gap-3 text-sm animate-in slide-in-from-top-2 duration-300">
			<div className="flex items-center gap-2 min-w-0">
				<Download className="h-4 w-4 shrink-0 text-muted-foreground" />
				{isIOS ? (
					<p className="text-muted-foreground truncate">
						Instalează aplicația: apasă butonul de partajare ⎋ apoi &quot;Adaugă
						pe Ecranul Principal&quot; ➕
					</p>
				) : (
					<p className="text-muted-foreground truncate">
						Instalează TransplantCare pentru acces rapid
					</p>
				)}
			</div>
			<div className="flex items-center gap-2 shrink-0">
				{!isIOS && (
					<Button size="sm" variant="default" onClick={onAccept}>
						Instalează
					</Button>
				)}
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
