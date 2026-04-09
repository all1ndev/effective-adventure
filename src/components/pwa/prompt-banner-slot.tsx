"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
	usePromptOrchestrator,
	type ActivePrompt,
} from "@/hooks/use-prompt-orchestrator";
import { InstallPromptBanner } from "@/components/pwa/install-prompt";
import { PushPromptBanner } from "@/components/pwa/push-notification-manager";

const BANNER_DELAY_MS = 5000;

export function PromptBannerSlot() {
	const {
		activeBanners,
		role,
		isIOS,
		pushLoading,
		dismissPrompt,
		acceptPush,
		acceptInstall,
	} = usePromptOrchestrator();

	const [delayPassed, setDelayPassed] = useState(false);
	const toastFiredRef = useRef<Set<string>>(new Set());

	// Start delay timer once on mount
	useEffect(() => {
		const timer = setTimeout(() => setDelayPassed(true), BANNER_DELAY_MS);
		return () => clearTimeout(timer);
	}, []);

	// Fire toasts for toast-format prompts
	useEffect(() => {
		for (const prompt of activeBanners) {
			if (prompt.format !== "toast" || toastFiredRef.current.has(prompt.type))
				continue;

			toastFiredRef.current.add(prompt.type);

			if (prompt.type === "push") {
				toast("Vrei să primești notificări importante?", {
					action: {
						label: "Activează",
						onClick: () => acceptPush(),
					},
					onDismiss: () => dismissPrompt("push"),
					duration: 8000,
				});
			} else {
				toast("Instalează TransplantCare pentru acces rapid", {
					action: {
						label: "Instalează",
						onClick: () => acceptInstall(),
					},
					onDismiss: () => dismissPrompt("install"),
					duration: 8000,
				});
			}
		}
	}, [activeBanners, dismissPrompt, acceptPush, acceptInstall]);

	// Derive visible banners: show only after delay has passed
	const banners = delayPassed
		? activeBanners.filter((p) => p.format === "banner")
		: [];

	if (banners.length === 0) return null;

	return (
		<>
			{banners.map((prompt) => (
				<BannerItem
					key={prompt.type}
					prompt={prompt}
					role={role}
					isIOS={isIOS}
					pushLoading={pushLoading}
					onAcceptPush={acceptPush}
					onAcceptInstall={acceptInstall}
					onDismiss={dismissPrompt}
				/>
			))}
		</>
	);
}

function BannerItem({
	prompt,
	role,
	isIOS,
	pushLoading,
	onAcceptPush,
	onAcceptInstall,
	onDismiss,
}: {
	prompt: ActivePrompt;
	role: string | null;
	isIOS: boolean;
	pushLoading: boolean;
	onAcceptPush: () => void;
	onAcceptInstall: () => void;
	onDismiss: (type: "push" | "install") => void;
}) {
	if (prompt.type === "push" && role) {
		return (
			<PushPromptBanner
				role={role}
				isLoading={pushLoading}
				onAccept={onAcceptPush}
				onDismiss={() => onDismiss("push")}
			/>
		);
	}

	if (prompt.type === "install") {
		return (
			<InstallPromptBanner
				isIOS={isIOS}
				onAccept={onAcceptInstall}
				onDismiss={() => onDismiss("install")}
			/>
		);
	}

	return null;
}
