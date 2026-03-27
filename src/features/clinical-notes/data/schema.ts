import { z } from "zod";

export const clinicalNoteSchema = z.object({
	id: z.string(),
	patientId: z.string(),
	visitDate: z.string(),
	content: z.string(),
	author: z.string(),
});

export type ClinicalNote = z.infer<typeof clinicalNoteSchema>;
export const clinicalNoteListSchema = z.array(clinicalNoteSchema);

export const clinicalNoteFormSchema = z.object({
	visitDate: z.string().min(1, "Data vizitei este obligatorie."),
	content: z.string().min(1, "Observatiile sunt obligatorii."),
});

export type ClinicalNoteFormValues = z.infer<typeof clinicalNoteFormSchema>;
