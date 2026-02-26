import { z } from "zod";

export const messageSchema = z.object({
	id: z.string(),
	conversationId: z.string(),
	senderId: z.string(),
	senderName: z.string(),
	body: z.string(),
	sentAt: z.string(),
	read: z.boolean(),
});

export const conversationSchema = z.object({
	id: z.string(),
	patientId: z.string(),
	patientName: z.string(),
	lastMessage: z.string(),
	lastMessageAt: z.string(),
	unreadCount: z.number(),
});

export type Message = z.infer<typeof messageSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export const messageListSchema = z.array(messageSchema);
export const conversationListSchema = z.array(conversationSchema);
