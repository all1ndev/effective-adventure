import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Conversation } from "../data/schema";

interface ConversationListProps {
	conversations: Conversation[];
	activeId?: string;
	onSelect: (id: string) => void;
}

export function ConversationList({
	conversations,
	activeId,
	onSelect,
}: ConversationListProps) {
	return (
		<div className="space-y-1">
			{conversations.map((conv) => (
				<button
					key={conv.id}
					onClick={() => onSelect(conv.id)}
					className={cn(
						"flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted",
						activeId === conv.id && "bg-muted",
					)}
				>
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
						<MessageSquare className="h-4 w-4 text-primary" />
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex items-center justify-between">
							<p className="truncate text-sm font-medium">{conv.patientName}</p>
							{conv.unreadCount > 0 && (
								<Badge
									variant="default"
									className="ml-2 h-5 min-w-5 shrink-0 rounded-full px-1.5 text-xs"
								>
									{conv.unreadCount}
								</Badge>
							)}
						</div>
						<p className="truncate text-xs text-muted-foreground">
							{conv.lastMessage}
						</p>
					</div>
				</button>
			))}
		</div>
	);
}
