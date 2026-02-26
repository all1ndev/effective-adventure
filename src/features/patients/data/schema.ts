import { z } from "zod";

const patientStatusSchema = z.union([z.literal("activ"), z.literal("inactiv")]);
export type PatientStatus = z.infer<typeof patientStatusSchema>;

const patientEtiologySchema = z.union([
	z.literal("HBV"),
	z.literal("HDV"),
	z.literal("HCV"),
	z.literal("MASLD"),
	z.literal("alcool"),
	z.literal("autoimuna"),
	z.literal("altele"),
]);
export type PatientEtiology = z.infer<typeof patientEtiologySchema>;

const patientSchema = z.object({
	id: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	patientPhone: z.string().optional(),
	sex: z.union([
		z.literal("masculin"),
		z.literal("feminin"),
		z.literal("nespecificat"),
	]),
	age: z.number().min(0).max(130).optional(),
	etiology: patientEtiologySchema.optional(),
	transplantDate: z.string().optional(),
	status: patientStatusSchema,
});
export type Patient = z.infer<typeof patientSchema>;
export const patientListSchema = z.array(patientSchema);
