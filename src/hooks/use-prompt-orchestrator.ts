"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { getUserRole, type AppRole } from "@/lib/roles";
import { usePushSubscription } from "@/hooks/use-push-subscription";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import {
	getPromptState,
	incrementVisitCount,
	recordDismissal,
	recordAcceptance,
	shouldShowPushPrompt,
	shouldShowInstallPrompt,
	type PromptFormat,
} from "@/lib/prompt-storage";

export type PromptType = "push" | "install";

export interface ActivePrompt {
	type: PromptType;
	format: PromptFormat;
}

export function usePromptOrchestrator() {
	const { data: session } = useSession();
	const role = getUserRole(session?.user?.role);

	const pushSub = usePushSubscription();
	const install = useInstallPrompt();

	// Track dismissed prompts within the session (to hide after dismiss without re-reading localStorage)
	const [dismissed, setDismissed] = useState<Set<PromptType>>(new Set());

	const visitCountedRef = useRef(false);

	// Increment visit count once per session (side effect only, no state)
	useEffect(() => {
		if (!visitCountedRef.current) {
			visitCountedRef.current = true;
			incrementVisitCount();
		}
	}, []);

	// Compute which prompts to show (pure derivation, no setState)
	const { activeBanners, activeInline } = useMemo(() => {
		const noop = {
			activeBanners: [] as ActivePrompt[],
			activeInline: null as ActivePrompt | null,
		};
		if (!role) return noop;

		const state = getPromptState();

		const pushEligible =
			pushSub.isSupported && !pushSub.subscription && !pushSub.permissionDenied;

		const installEligible = install.isStandalone
			? false
			: install.canInstall || install.isIOS;

		let pushDecision = { show: false, format: "banner" as PromptFormat };
		let installDecision = { show: false, format: "banner" as PromptFormat };

		if (pushEligible && !dismissed.has("push")) {
			pushDecision = shouldShowPushPrompt(state);
		}

		if (installEligible && !dismissed.has("install")) {
			installDecision = shouldShowInstallPrompt(state);
		}

		let newInline: ActivePrompt | null = null;
		const newBanners: ActivePrompt[] = [];

		if (pushDecision.show) {
			if (pushDecision.format === "inline") {
				newInline = { type: "push", format: "inline" };
			} else {
				newBanners.push({ type: "push", format: pushDecision.format });
			}
		}

		if (installDecision.show && installDecision.format !== "inline") {
			newBanners.push({ type: "install", format: installDecision.format });
		}

		return { activeBanners: newBanners, activeInline: newInline };
	}, [
		role,
		dismissed,
		pushSub.isSupported,
		pushSub.subscription,
		pushSub.permissionDenied,
		install.isStandalone,
		install.canInstall,
		install.isIOS,
	]);

	const dismissPrompt = useCallback((type: PromptType) => {
		recordDismissal(type);
		setDismissed((prev) => new Set(prev).add(type));
	}, []);

	const acceptPush = useCallback(async () => {
		const success = await pushSub.subscribeToPush();
		if (success) {
			recordAcceptance("push");
			setDismissed((prev) => new Set(prev).add("push"));
		}
		return success;
	}, [pushSub]);

	const acceptInstall = useCallback(async () => {
		const success = await install.triggerInstall();
		if (success) {
			recordAcceptance("install");
			setDismissed((prev) => new Set(prev).add("install"));
		}
		return success;
	}, [install]);

	return {
		activeBanners,
		activeInline,
		role: role as AppRole | null,
		isIOS: install.isIOS,
		pushLoading: pushSub.isLoading,
		pushError: pushSub.error,
		dismissPrompt,
		acceptPush,
		acceptInstall,
	};
}
