"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

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

	return (
		<div>
			<h3 className="text-lg font-semibold">Instalează Aplicația</h3>
			{canInstall ? (
				<Button onClick={handleInstallClick}>
					Adaugă pe Ecranul Principal
				</Button>
			) : isIOS ? (
				<p>
					Pentru a instala această aplicație pe dispozitivul iOS, apasă butonul
					de partajare
					<span role="img" aria-label="share icon">
						{" "}
						⎋{" "}
					</span>
					și apoi &quot;Adaugă pe Ecranul Principal&quot;
					<span role="img" aria-label="plus icon">
						{" "}
						➕{" "}
					</span>
					.
				</p>
			) : null}
		</div>
	);
}
