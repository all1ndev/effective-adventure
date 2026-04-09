"use client";

import { usePromptOrchestrator } from "@/hooks/use-prompt-orchestrator";

export function PushPromptInline() {
	const { activeInline, acceptPush, pushLoading } = usePromptOrchestrator();

	if (activeInline?.type !== "push") return null;

	return (
		<p className="text-sm text-muted-foreground">
			Nu primești notificări push.{" "}
			<button
				type="button"
				className="underline underline-offset-2 hover:text-foreground transition-colors disabled:opacity-50"
				onClick={acceptPush}
				disabled={pushLoading}
			>
				{pushLoading ? "Se procesează..." : "Activează acum"}
			</button>
		</p>
	);
}
