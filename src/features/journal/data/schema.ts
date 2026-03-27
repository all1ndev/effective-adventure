import { z } from "zod";

export const moodSchema = z.union([
	z.literal("excelent"),
	z.literal("bine"),
	z.literal("neutru"),
	z.literal("rau"),
	z.literal("foarte-rau"),
]);
export type Mood = z.infer<typeof moodSchema>;

export const journalEntrySchema = z.object({
	id: z.string(),
	date: z.string(),
	mood: moodSchema,
	content: z.string(),
});

export type JournalEntry = z.infer<typeof journalEntrySchema>;
export const journalEntryListSchema = z.array(journalEntrySchema);

export const journalEntryFormSchema = z.object({
	mood: moodSchema,
	content: z.string().min(1, "Continutul este obligatoriu."),
});

export type JournalEntryFormValues = z.infer<typeof journalEntryFormSchema>;
