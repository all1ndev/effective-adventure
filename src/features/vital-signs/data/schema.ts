import { z } from "zod";

export const vitalEntrySchema = z.object({
	id: z.string(),
	patientId: z.string(),
	date: z.string(),
	systolic: z.number().min(60).max(250),
	diastolic: z.number().min(40).max(150),
	temperature: z.number().min(35).max(42),
	pulse: z.number().min(30).max(200),
	weight: z.number().min(20).max(300),
});

export type VitalEntry = z.infer<typeof vitalEntrySchema>;
export const vitalEntryListSchema = z.array(vitalEntrySchema);

export const vitalEntryFormSchema = z.object({
	systolic: z.number().min(60).max(250),
	diastolic: z.number().min(40).max(150),
	temperature: z.number().min(35).max(42),
	pulse: z.number().min(30).max(200),
	weight: z.number().min(20).max(300),
});

export type VitalEntryFormValues = z.infer<typeof vitalEntryFormSchema>;
