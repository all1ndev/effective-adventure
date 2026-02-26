import { z } from "zod";

export const alertSeveritySchema = z.union([
	z.literal("critical"),
	z.literal("warning"),
	z.literal("info"),
]);
export type AlertSeverity = z.infer<typeof alertSeveritySchema>;

export const alertTypeSchema = z.union([
	z.literal("vital"),
	z.literal("simptom"),
	z.literal("laborator"),
	z.literal("medicatie"),
]);

export const alertSchema = z.object({
	id: z.string(),
	patientId: z.string(),
	patientName: z.string(),
	type: alertTypeSchema,
	severity: alertSeveritySchema,
	message: z.string(),
	createdAt: z.string(),
	dismissed: z.boolean(),
});

export type Alert = z.infer<typeof alertSchema>;
export const alertListSchema = z.array(alertSchema);
