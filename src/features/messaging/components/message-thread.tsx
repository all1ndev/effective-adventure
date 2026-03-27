import { cn } from "@/lib/utils";
interface MessageItem {
	id: string;
	senderId: string;
	senderName: string;
	body: string;
	sentAt: Date | string;
}

interface MessageThreadProps {
	messages: MessageItem[];
	currentUserId?: string;
}

export function MessageThread({
	messages,
	currentUserId = "doctor-1",
}: MessageThreadProps) {
	return (
		<div className="flex flex-col gap-3 p-4">
			{messages.map((msg) => {
				const isOwn = msg.senderId === currentUserId;
				return (
					<div
						key={msg.id}
						className={cn(
							"flex flex-col gap-1",
							isOwn ? "items-end" : "items-start",
						)}
					>
						{!isOwn && (
							<span className="text-xs text-muted-foreground">
								{msg.senderName}
							</span>
						)}
						<div
							className={cn(
								"max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
								isOwn
									? "bg-primary text-primary-foreground"
									: "bg-muted text-foreground",
							)}
						>
							{msg.body}
						</div>
						<span className="text-xs text-muted-foreground">
							{new Date(msg.sentAt).toLocaleTimeString("ro-RO", {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
					</div>
				);
			})}
		</div>
	);
}
