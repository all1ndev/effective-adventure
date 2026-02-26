"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
	onSend?: (message: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
	const [value, setValue] = useState("");

	function handleSend() {
		if (!value.trim()) return;
		onSend?.(value.trim());
		setValue("");
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	}

	return (
		<div className="flex items-end gap-2 border-t p-4">
			<Textarea
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Scrieti un mesaj... (Enter pentru trimitere)"
				rows={2}
				className="resize-none"
			/>
			<Button
				size="icon"
				onClick={handleSend}
				disabled={!value.trim()}
				className="shrink-0"
			>
				<Send className="h-4 w-4" />
				<span className="sr-only">Trimite</span>
			</Button>
		</div>
	);
}
