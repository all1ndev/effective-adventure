import { type Conversation, type Message } from "./schema";

export const conversations: Conversation[] = [
	{
		id: "1",
		patientId: "1",
		patientName: "Alexandru Ionescu",
		lastMessage: "Multumesc pentru raspuns, doctor.",
		lastMessageAt: "2026-02-26T09:45:00",
		unreadCount: 0,
	},
	{
		id: "2",
		patientId: "2",
		patientName: "Maria Popescu",
		lastMessage: "Ar trebui sa vin la control mai devreme?",
		lastMessageAt: "2026-02-25T16:30:00",
		unreadCount: 2,
	},
	{
		id: "3",
		patientId: "4",
		patientName: "Elena Constantin",
		lastMessage: "Am o intrebare despre medicatie.",
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
		body: "Buna ziua, doctor. Am observat ca tensiunea mea a crescut in ultimele zile.",
		sentAt: "2026-02-26T09:30:00",
		read: true,
	},
	{
		id: "2",
		conversationId: "1",
		senderId: "doctor-1",
		senderName: "Dr. Andrei Marin",
		body: "Buna ziua, Alexandru. Va rog sa continuati monitorizarea tensiunii si sa evitati alimentele sarate. Daca tensiunea depaseste 140/90, contactati-ma urgent.",
		sentAt: "2026-02-26T09:40:00",
		read: true,
	},
	{
		id: "3",
		conversationId: "1",
		senderId: "1",
		senderName: "Alexandru Ionescu",
		body: "Multumesc pentru raspuns, doctor.",
		sentAt: "2026-02-26T09:45:00",
		read: true,
	},
	{
		id: "4",
		conversationId: "2",
		senderId: "2",
		senderName: "Maria Popescu",
		body: "Doctor, rezultatele mele de laborator arata valori ridicate. Sunt ingrijorata.",
		sentAt: "2026-02-25T16:00:00",
		read: true,
	},
	{
		id: "5",
		conversationId: "2",
		senderId: "2",
		senderName: "Maria Popescu",
		body: "Ar trebui sa vin la control mai devreme?",
		sentAt: "2026-02-25T16:30:00",
		read: false,
	},
];
