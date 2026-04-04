"use client";

import { useEffect, useState } from "react";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Spinner } from "@/components/ui/spinner";
import { Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
		let firstActiveId = "";
		Promise.all([
			getCurrentUser().then((u) => {
				setCurrentUserId(u.id);
				setCurrentUserRole(u.role ?? "");
			}),
			getConversations().then((data) => {
				setConversations(data);
				if (data.length > 0) firstActiveId = data[0].id;
			}),
		])
			.then(() => {
				if (firstActiveId) {
					setActiveId(firstActiveId);
					return getMessages(firstActiveId).then(setThreadMessages);
				}
			})
			.catch(() => {
				toast.error("Eroare la încărcarea mesageriei.");
			})
			.finally(() => setLoading(false));
	}, []);

	function handleSelectConversation(id: string) {
		setActiveId(id);
		getMessages(id).then(setThreadMessages);
	}

	const activeConv = conversations.find((c) => c.id === activeId);

	async function handleSend(body: string) {
		if (!activeId) return;
		const result = await sendMessage(activeId, body);
		if (!result.success) {
			toast.error("Eroare la trimiterea mesajului.");
			return;
		}
		if (result.message) {
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
						{(currentUserRole === "admin" || currentUserRole === "doctor") && (
							<aside className="w-72 shrink-0 border-r p-4">
								<h2 className="mb-3 text-lg font-bold">Mesagerie</h2>
								<ConversationList
									conversations={conversations}
									activeId={activeId}
									onSelect={handleSelectConversation}
								/>
							</aside>
						)}
						<div className="flex flex-1 flex-col overflow-hidden">
							{activeConv ? (
								<>
									<div className="flex items-center justify-between border-b px-4 py-3">
										<div>
											<h3 className="font-semibold">
												{activeConv.patientName}
											</h3>
											<p className="text-xs text-muted-foreground">
												{currentUserRole === "admin" ||
												currentUserRole === "doctor"
													? `Pacient${activeConv.doctorName ? ` · Dr. ${activeConv.doctorName}` : ""}`
													: "Medic responsabil"}
											</p>
										</div>
										{activeConv.phone && (
											<Button
												variant="outline"
												size="icon"
												asChild
												className="shrink-0"
											>
												<a href={`tel:${activeConv.phone}`}>
													<Phone className="h-4 w-4" />
													<span className="sr-only">Sună</span>
												</a>
											</Button>
										)}
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
									{currentUserRole === "admin" || currentUserRole === "doctor"
										? "Selectați o conversație"
										: "Nu există o conversație activă"}
								</div>
							)}
						</div>
					</div>
				)}
			</Main>
		</>
	);
}
