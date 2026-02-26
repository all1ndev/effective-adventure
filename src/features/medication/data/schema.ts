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
