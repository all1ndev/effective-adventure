"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

function getIsIOS() {
	return (
		/iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
	);
}

function getIsStandalone() {
	return window.matchMedia("(display-mode: standalone)").matches;
}

export function InstallPrompt() {
	const isIOS = useSyncExternalStore(emptySubscribe, getIsIOS, () => false);
	const isStandalone = useSyncExternalStore(
		emptySubscribe,
		getIsStandalone,
		() => false,
	);

	if (isStandalone) {
		return null;
	}

	return (
		<div>
			<h3 className="text-lg font-semibold">Instalează Aplicația</h3>
			<Button>Adaugă pe Ecranul Principal</Button>
			{isIOS && (
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
			)}
		</div>
	);
}
