"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ArrowLeft, Phone } from "lucide-react";
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
	const activeIdRef = useRef("");
	const threadRef = useRef<HTMLDivElement>(null);
	const lastMsgCountRef = useRef(0);

	// Keep ref in sync with state for use in intervals
	useEffect(() => {
		activeIdRef.current = activeId;
	}, [activeId]);

	// Scroll to bottom when new messages arrive
	useEffect(() => {
		if (threadMessages.length > lastMsgCountRef.current && threadRef.current) {
			threadRef.current.scrollTop = threadRef.current.scrollHeight;
		}
		lastMsgCountRef.current = threadMessages.length;
	}, [threadMessages.length]);

	// Initial load
	useEffect(() => {
		let firstActiveId = "";
		let userRole = "";
		Promise.all([
			getCurrentUser().then((u) => {
				setCurrentUserId(u.id);
				setCurrentUserRole(u.role ?? "");
				userRole = u.role ?? "";
			}),
			getConversations().then((data) => {
				setConversations(data);
				if (data.length > 0) firstActiveId = data[0].id;
			}),
		])
			.then(() => {
				// On mobile, admin/doctor start on the conversation list
				const mobile = window.innerWidth < 768;
				const skipAutoSelect =
					mobile && (userRole === "admin" || userRole === "doctor");
				if (firstActiveId && !skipAutoSelect) {
					setActiveId(firstActiveId);
					activeIdRef.current = firstActiveId;
					if (userRole !== "admin") {
						setConversations((prev) =>
							prev.map((c) =>
								c.id === firstActiveId ? { ...c, unreadCount: 0 } : c,
							),
						);
					}
					return getMessages(firstActiveId).then(setThreadMessages);
				}
			})
			.catch(() => {
				toast.error("Eroare la încărcarea mesageriei.");
			})
			.finally(() => setLoading(false));
	}, []);

	// Poll active conversation messages every 3 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			const id = activeIdRef.current;
			if (!id) return;
			getMessages(id).then((msgs) => {
				if (activeIdRef.current === id) {
					setThreadMessages(msgs);
				}
			});
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	// Poll conversations list every 10 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			getConversations().then(setConversations);
		}, 10000);
		return () => clearInterval(interval);
	}, []);

	const handleSelectConversation = useCallback(
		(id: string) => {
			setActiveId(id);
			activeIdRef.current = id;
			setThreadMessages([]);
			if (currentUserRole !== "admin") {
				setConversations((prev) =>
					prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
				);
			}
			getMessages(id).then((msgs) => {
				if (activeIdRef.current === id) setThreadMessages(msgs);
			});
		},
		[currentUserRole],
	);

	const activeConv = conversations.find((c) => c.id === activeId);
	const isAdminOrDoctor =
		currentUserRole === "admin" || currentUserRole === "doctor";

	// On mobile, go back to conversation list
	function handleBack() {
		setActiveId("");
		activeIdRef.current = "";
		setThreadMessages([]);
	}

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

			<Main fixed className="flex flex-1 overflow-hidden p-0">
				{loading ? (
					<div className="flex flex-1 items-center justify-center">
						<Spinner className="size-6" />
					</div>
				) : (
					<div className="flex h-full w-full">
						{isAdminOrDoctor && (
							<aside
								className={cn(
									"flex shrink-0 flex-col border-r",
									// Mobile: full width, hidden when a conversation is active
									activeId ? "hidden md:flex" : "w-full md:w-72",
									// Desktop: always fixed width
									"md:w-72",
								)}
							>
								<h2 className="border-b p-4 text-lg font-bold">Mesagerie</h2>
								<div className="min-h-0 flex-1 overflow-y-auto p-2">
									<ConversationList
										conversations={conversations}
										activeId={activeId}
										onSelect={handleSelectConversation}
									/>
								</div>
							</aside>
						)}
						<div
							className={cn(
								"flex flex-1 flex-col overflow-hidden",
								// Mobile: hidden when no conversation is active (show list instead)
								isAdminOrDoctor && !activeId && "hidden md:flex",
							)}
						>
							{activeConv ? (
								<>
									<div className="flex items-center justify-between border-b px-4 py-3">
										<div className="flex items-center gap-3">
											{isAdminOrDoctor && (
												<Button
													variant="ghost"
													size="icon"
													onClick={handleBack}
													className="shrink-0 md:hidden"
												>
													<ArrowLeft className="h-4 w-4" />
													<span className="sr-only">Înapoi</span>
												</Button>
											)}
											<div>
												<h3 className="font-semibold">
													{activeConv.patientName}
												</h3>
												<p className="text-xs text-muted-foreground">
													{isAdminOrDoctor
														? `Pacient${activeConv.doctorName ? ` · Dr. ${activeConv.doctorName}` : ""}`
														: "Medic responsabil"}
												</p>
											</div>
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
									<div
										ref={threadRef}
										className="min-h-0 flex-1 overflow-y-auto"
									>
										<MessageThread
											messages={threadMessages}
											currentUserId={currentUserId}
											patientId={activeConv.patientId}
											viewerRole={currentUserRole}
										/>
									</div>
									{currentUserRole !== "admin" && (
										<MessageInput onSend={handleSend} />
									)}
								</>
							) : (
								<div className="flex flex-1 items-center justify-center text-muted-foreground">
									{isAdminOrDoctor
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
