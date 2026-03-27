"use client";

import { useEffect, useState } from "react";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Spinner } from "@/components/ui/spinner";
import { ConversationList } from "./components/conversation-list";
import { MessageThread } from "./components/message-thread";
import { MessageInput } from "./components/message-input";
import {
	getCurrentUser,
	getConversations,
	getMessages,
	sendMessage,
} from "./actions";

type ConversationRow = Awaited<ReturnType<typeof getConversations>>[number];
type MessageRow = Awaited<ReturnType<typeof getMessages>>[number];

export function Messaging() {
	const [conversations, setConversations] = useState<ConversationRow[]>([]);
	const [activeId, setActiveId] = useState<string>("");
	const [threadMessages, setThreadMessages] = useState<MessageRow[]>([]);
	const [currentUserId, setCurrentUserId] = useState<string>("");
	const [currentUserRole, setCurrentUserRole] = useState<string>("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		Promise.all([
			getCurrentUser().then((u) => {
				setCurrentUserId(u.id);
				setCurrentUserRole(u.role ?? "");
			}),
			getConversations().then((data) => {
				setConversations(data);
				if (data.length > 0) setActiveId(data[0].id);
			}),
		]).then(() => setLoading(false));
	}, []);

	useEffect(() => {
		if (activeId) {
			getMessages(activeId).then(setThreadMessages);
		}
	}, [activeId]);

	const activeConv = conversations.find((c) => c.id === activeId);

	async function handleSend(body: string) {
		if (!activeId) return;
		const result = await sendMessage(activeId, body);
		if (result.success && result.message) {
			setThreadMessages((prev) => [
				...prev,
				{
					...result.message,
					sentAt: new Date(),
				},
			]);
			setConversations((prev) =>
				prev.map((c) =>
					c.id === activeId
						? { ...c, lastMessage: body, lastMessageAt: new Date() }
						: c,
				),
			);
		}
	}

	return (
		<>
			<Header fixed>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					<ConfigDrawer />
				</div>
			</Header>

			<Main className="flex flex-1 overflow-hidden p-0">
				{loading ? (
					<div className="flex flex-1 items-center justify-center">
						<Spinner className="size-6" />
					</div>
				) : (
					<div className="flex h-full w-full">
						{currentUserRole === "admin" && (
							<aside className="w-72 shrink-0 border-r p-4">
								<h2 className="mb-3 text-lg font-bold">Mesagerie</h2>
								<ConversationList
									conversations={conversations}
									activeId={activeId}
									onSelect={setActiveId}
								/>
							</aside>
						)}
						<div className="flex flex-1 flex-col overflow-hidden">
							{activeConv ? (
								<>
									<div className="border-b px-4 py-3">
										<h3 className="font-semibold">{activeConv.patientName}</h3>
										<p className="text-xs text-muted-foreground">
											{currentUserRole === "admin"
												? "Pacient"
												: "Medic responsabil"}
										</p>
									</div>
									<div className="flex-1 overflow-y-auto">
										<MessageThread
											messages={threadMessages}
											currentUserId={currentUserId}
										/>
									</div>
									<MessageInput onSend={handleSend} />
								</>
							) : (
								<div className="flex flex-1 items-center justify-center text-muted-foreground">
									{currentUserRole === "admin"
										? "Selectati o conversatie"
										: "Nu exista o conversatie activa"}
								</div>
							)}
						</div>
					</div>
				)}
			</Main>
		</>
	);
}
