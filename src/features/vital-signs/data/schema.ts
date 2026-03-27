import { z } from "zod";

export const vitalStatusSchema = z.enum(["normal", "warning", "critical"]);
export type VitalStatus = z.infer<typeof vitalStatusSchema>;

export const vitalEntrySchema = z.object({
	id: z.string(),
	patientId: z.string(),
	date: z.string(),
	systolic: z.number().min(60).max(250),
	diastolic: z.number().min(40).max(150),
	temperature: z.number().min(35).max(42),
	pulse: z.number().min(30).max(200),
	weight: z.number().min(20).max(300),
	status: vitalStatusSchema,
});

export type VitalEntry = z.infer<typeof vitalEntrySchema>;
export const vitalEntryListSchema = z.array(vitalEntrySchema);

export const vitalEntryFormSchema = z.object({
	systolic: z
		.number({ error: "Câmpul este obligatoriu." })
		.min(60, "Minim 60.")
		.max(250, "Maxim 250."),
	diastolic: z
		.number({ error: "Câmpul este obligatoriu." })
		.min(40, "Minim 40.")
		.max(150, "Maxim 150."),
	temperature: z
		.number({ error: "Câmpul este obligatoriu." })
		.min(35, "Minim 35.")
		.max(42, "Maxim 42."),
	pulse: z
		.number({ error: "Câmpul este obligatoriu." })
		.min(30, "Minim 30.")
		.max(200, "Maxim 200."),
	weight: z
		.number({ error: "Câmpul este obligatoriu." })
		.min(20, "Minim 20.")
		.max(300, "Maxim 300."),
});

export type VitalEntryFormValues = z.infer<typeof vitalEntryFormSchema>;
