"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const emptySubscribe = () => () => {};

function getIsStandalone() {
	return window.matchMedia("(display-mode: standalone)").matches;
}

function getIsMobile() {
	return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent,
	);
}

function getIsIOS() {
	return (
		/iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
	);
}

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
	const isStandalone = useSyncExternalStore(
		emptySubscribe,
		getIsStandalone,
		() => false,
	);
	const isMobile = useSyncExternalStore(
		emptySubscribe,
		getIsMobile,
		() => false,
	);
	const isIOS = useSyncExternalStore(emptySubscribe, getIsIOS, () => false);

	const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
	const [canInstall, setCanInstall] = useState(false);

	useEffect(() => {
		function handleBeforeInstallPrompt(e: Event) {
			e.preventDefault();
			deferredPromptRef.current = e as BeforeInstallPromptEvent;
			setCanInstall(true);
		}

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt,
			);
		};
	}, []);

	async function handleInstallClick() {
		const prompt = deferredPromptRef.current;
		if (!prompt) return;

		await prompt.prompt();
		const { outcome } = await prompt.userChoice;
		if (outcome === "accepted") {
			setCanInstall(false);
		}
		deferredPromptRef.current = null;
	}

	if (isStandalone || !isMobile) {
		return null;
	}

	// Nothing to show if no install prompt and not iOS
	if (!canInstall && !isIOS) {
		return null;
	}

	return (
		<Card>
			<CardContent className="flex items-center justify-between gap-4 p-4">
				<div className="space-y-1">
					<h3 className="text-sm font-semibold">Instalează Aplicația</h3>
					{isIOS && !canInstall && (
						<p className="text-sm text-muted-foreground">
							Apasă butonul de partajare ⎋ și apoi &quot;Adaugă pe Ecranul
							Principal&quot; ➕
						</p>
					)}
				</div>
				{canInstall && (
					<Button size="sm" onClick={handleInstallClick}>
						Instalează
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
