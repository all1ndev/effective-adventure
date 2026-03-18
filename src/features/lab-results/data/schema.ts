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
