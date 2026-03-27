import { z } from "zod";

export const medicationSchema = z.object({
	id: z.string(),
	patientId: z.string(),
	name: z.string(),
	dose: z.string(),
	frequency: z.string(),
	startDate: z.string(),
	endDate: z.string().optional(),
});

export const medicationLogSchema = z.object({
	id: z.string(),
	medicationId: z.string(),
	takenAt: z.string(),
	status: z.union([
		z.literal("luat"),
		z.literal("omis"),
		z.literal("intarziat"),
	]),
});

export type Medication = z.infer<typeof medicationSchema>;
export type MedicationLog = z.infer<typeof medicationLogSchema>;
export const medicationListSchema = z.array(medicationSchema);
export const medicationLogListSchema = z.array(medicationLogSchema);

export const medicationFormSchema = z.object({
	name: z.string().min(1, "Numele este obligatoriu."),
	dose: z.string().min(1, "Doza este obligatorie."),
	frequency: z.string().min(1, "Frecventa este obligatorie."),
	startDate: z.string().min(1, "Data de inceput este obligatorie."),
	endDate: z.string().optional(),
});
export type MedicationFormValues = z.infer<typeof medicationFormSchema>;

export const medicationLogFormSchema = z.object({
	medicationId: z.string(),
	status: z.union([
		z.literal("luat"),
		z.literal("omis"),
		z.literal("intarziat"),
	]),
	takenAt: z.string(),
});
export type MedicationLogFormValues = z.infer<typeof medicationLogFormSchema>;
