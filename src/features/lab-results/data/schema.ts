import { z } from "zod";

export const testValueSchema = z.object({
	name: z.string(),
	value: z.number(),
	unit: z.string(),
	refMin: z.number(),
	refMax: z.number(),
});

export const labResultSchema = z.object({
	id: z.string(),
	patientId: z.string(),
	date: z.string(),
	tests: z.array(testValueSchema),
});

export type TestValue = z.infer<typeof testValueSchema>;
export type LabResult = z.infer<typeof labResultSchema>;
export const labResultListSchema = z.array(labResultSchema);

export const labResultFormSchema = z.object({
	date: z.string().min(1, "Data este obligatorie."),
	tests: z.array(testValueSchema).min(1, "Adaugati cel putin un parametru."),
});

export type LabResultFormValues = z.infer<typeof labResultFormSchema>;
