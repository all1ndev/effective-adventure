"use client";

import { useState } from "react";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConversationList } from "./components/conversation-list";
import { MessageThread } from "./components/message-thread";
import { MessageInput } from "./components/message-input";
import { conversations, messages } from "./data/messages";
import { type Message } from "./data/schema";

export function Messaging() {
	const [activeId, setActiveId] = useState<string>(conversations[0]?.id ?? "");
	const [threadMessages, setThreadMessages] = useState<Message[]>(messages);

	const activeConv = conversations.find((c) => c.id === activeId);
	const thread = threadMessages.filter((m) => m.conversationId === activeId);

	function handleSend(body: string) {
		const newMsg: Message = {
			id: String(Date.now()),
			conversationId: activeId,
			senderId: "doctor-1",
			senderName: "Dr. Andrei Marin",
			body,
			sentAt: new Date().toISOString(),
			read: true,
		};
		setThreadMessages((prev) => [...prev, newMsg]);
	}

	return (
		<>
			<Header fixed>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					<ConfigDrawer />
					<ProfileDropdown />
				</div>
			</Header>

			<Main className="flex flex-1 overflow-hidden p-0">
				<div className="flex h-full w-full">
					<aside className="w-72 shrink-0 border-r p-4">
						<h2 className="mb-3 text-lg font-bold">Mesagerie</h2>
						<ConversationList
							conversations={conversations}
							activeId={activeId}
							onSelect={setActiveId}
						/>
					</aside>
					<div className="flex flex-1 flex-col overflow-hidden">
						{activeConv ? (
							<>
								<div className="border-b px-4 py-3">
									<h3 className="font-semibold">{activeConv.patientName}</h3>
									<p className="text-xs text-muted-foreground">Pacient</p>
								</div>
								<div className="flex-1 overflow-y-auto">
									<MessageThread messages={thread} />
								</div>
								<MessageInput onSend={handleSend} />
							</>
						) : (
							<div className="flex flex-1 items-center justify-center text-muted-foreground">
								Selectati o conversatie
							</div>
						)}
					</div>
				</div>
			</Main>
		</>
	);
}
