import { z } from "zod";

export const testValueSchema = z.object({
	name: z.string().min(1, "Câmpul este obligatoriu."),
	value: z.number({ error: "Câmpul este obligatoriu." }),
	unit: z.string().min(1, "Câmpul este obligatoriu."),
	refMin: z.number({ error: "Câmpul este obligatoriu." }),
	refMax: z.number({ error: "Câmpul este obligatoriu." }),
});

export const labResultSchema = z.object({
	id: z.string(),
	patientId: z.string(),
	date: z.string(),
	tests: z.array(testValueSchema),
	pdfFileName: z.string().nullable().optional(),
});

export type TestValue = z.infer<typeof testValueSchema>;
export type LabResult = z.infer<typeof labResultSchema>;
export const labResultListSchema = z.array(labResultSchema);
