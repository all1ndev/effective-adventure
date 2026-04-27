import { type Conversation, type Message } from "./schema";

export const conversations: Conversation[] = [
	{
		id: "1",
		patientId: "1",
		patientName: "Alexandru Ionescu",
		lastMessage: "Mulțumesc pentru răspuns, doctor.",
		lastMessageAt: "2026-02-26T09:45:00",
		unreadCount: 0,
	},
	{
		id: "2",
		patientId: "2",
		patientName: "Maria Popescu",
		lastMessage: "Ar trebui să vin la control mai devreme?",
		lastMessageAt: "2026-02-25T16:30:00",
		unreadCount: 2,
	},
	{
		id: "3",
		patientId: "4",
		patientName: "Elena Constantin",
		lastMessage: "Am o întrebare despre medicație.",
		lastMessageAt: "2026-02-24T11:00:00",
		unreadCount: 1,
	},
];

export const messages: Message[] = [
	{
		id: "1",
		conversationId: "1",
		senderId: "1",
		senderName: "Alexandru Ionescu",
		body: "Bună ziua, doctor. Am observat că tensiunea mea a crescut în ultimele zile.",
		sentAt: "2026-02-26T09:30:00",
		read: true,
	},
	{
		id: "2",
		conversationId: "1",
		senderId: "doctor-1",
		senderName: "Dr. Andrei Marin",
		body: "Bună ziua, Alexandru. Vă rog să continuați monitorizarea tensiunii și să evitați alimentele sărate. Dacă tensiunea depășește 140/90, contactați-mă urgent.",
		sentAt: "2026-02-26T09:40:00",
		read: true,
	},
	{
		id: "3",
		conversationId: "1",
		senderId: "1",
		senderName: "Alexandru Ionescu",
		body: "Mulțumesc pentru răspuns, doctor.",
		sentAt: "2026-02-26T09:45:00",
		read: true,
	},
	{
		id: "4",
		conversationId: "2",
		senderId: "2",
		senderName: "Maria Popescu",
		body: "Doctor, rezultatele mele de laborator arată valori ridicate. Sunt îngrijorată.",
		sentAt: "2026-02-25T16:00:00",
		read: true,
	},
	{
		id: "5",
		conversationId: "2",
		senderId: "2",
		senderName: "Maria Popescu",
		body: "Ar trebui să vin la control mai devreme?",
		sentAt: "2026-02-25T16:30:00",
		read: false,
	},
];
