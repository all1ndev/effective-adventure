const STORAGE_KEY = "tc_prompt_state";

export interface PromptState {
	visitCount: number;
	firstVisitAt: string;
	lastVisitAt: string;
	pushDismissedAt: string | null;
	pushDismissCount: number;
	pushAccepted: boolean;
	installDismissedAt: string | null;
	installDismissCount: number;
	installAccepted: boolean;
}

function getDefaultState(): PromptState {
	const now = new Date().toISOString();
	return {
		visitCount: 0,
		firstVisitAt: now,
		lastVisitAt: now,
		pushDismissedAt: null,
		pushDismissCount: 0,
		pushAccepted: false,
		installDismissedAt: null,
		installDismissCount: 0,
		installAccepted: false,
	};
}

export function getPromptState(): PromptState {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return getDefaultState();
		return { ...getDefaultState(), ...JSON.parse(raw) };
	} catch {
		return getDefaultState();
	}
}

export function updatePromptState(partial: Partial<PromptState>): PromptState {
	const current = getPromptState();
	const updated = { ...current, ...partial };
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
	} catch {
		// localStorage full or unavailable
	}
	return updated;
}

export function incrementVisitCount(): PromptState {
	const state = getPromptState();
	return updatePromptState({
		visitCount: state.visitCount + 1,
		lastVisitAt: new Date().toISOString(),
	});
}

export function recordDismissal(prompt: "push" | "install"): PromptState {
	const state = getPromptState();
	if (prompt === "push") {
		return updatePromptState({
			pushDismissedAt: new Date().toISOString(),
			pushDismissCount: state.pushDismissCount + 1,
		});
	}
	return updatePromptState({
		installDismissedAt: new Date().toISOString(),
		installDismissCount: state.installDismissCount + 1,
	});
}

export function recordAcceptance(prompt: "push" | "install"): PromptState {
	if (prompt === "push") {
		return updatePromptState({ pushAccepted: true });
	}
	return updatePromptState({ installAccepted: true });
}

function daysSince(isoDate: string | null): number | null {
	if (!isoDate) return null;
	const diff = Date.now() - new Date(isoDate).getTime();
	return diff / (1000 * 60 * 60 * 24);
}

export type PromptFormat = "banner" | "toast" | "inline";

export interface PromptDecision {
	show: boolean;
	format: PromptFormat;
}

export function shouldShowPushPrompt(state: PromptState): PromptDecision {
	const no: PromptDecision = { show: false, format: "banner" };

	if (state.pushAccepted) return no;
	if (state.pushDismissCount >= 3) return no;

	const daysSinceDismiss = daysSince(state.pushDismissedAt);

	// Re-prompt logic for previously dismissed
	if (state.pushDismissCount === 1) {
		if (daysSinceDismiss === null || daysSinceDismiss < 3) return no;
		return { show: true, format: "inline" };
	}
	if (state.pushDismissCount === 2) {
		if (daysSinceDismiss === null || daysSinceDismiss < 14) return no;
		return { show: true, format: "toast" };
	}

	// First-time: show banner for all roles from visit 1
	return { show: true, format: "banner" };
}

export function shouldShowInstallPrompt(state: PromptState): PromptDecision {
	const no: PromptDecision = { show: false, format: "banner" };

	if (state.installAccepted) return no;
	if (state.installDismissCount >= 2) return no;

	const daysSinceDismiss = daysSince(state.installDismissedAt);

	if (state.installDismissCount === 1) {
		if (daysSinceDismiss === null || daysSinceDismiss < 7) return no;
		return { show: true, format: "toast" };
	}

	return { show: true, format: "banner" };
}
