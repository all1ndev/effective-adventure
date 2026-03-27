import { z } from "zod";

export const severitySchema = z.union([
	z.literal("usoara"),
	z.literal("moderata"),
	z.literal("severa"),
]);
export type Severity = z.infer<typeof severitySchema>;

export const symptomReportSchema = z.object({
	id: z.string(),
	patientId: z.string(),
	date: z.string(),
	symptoms: z.array(z.string()),
	severity: severitySchema,
	notes: z.string().optional(),
});

export type SymptomReport = z.infer<typeof symptomReportSchema>;
export const symptomReportListSchema = z.array(symptomReportSchema);

export const symptomReportFormSchema = z.object({
	symptoms: z.array(z.string()).min(1, "Selectati cel putin un simptom."),
	severity: severitySchema,
	notes: z.string().optional(),
});

export type SymptomReportFormValues = z.infer<typeof symptomReportFormSchema>;
