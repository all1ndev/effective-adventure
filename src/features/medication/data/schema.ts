import { z } from "zod";

export const medicationSchema = z.object({
	id: z.string(),
	patientId: z.string(),
	name: z.string(),
	dose: z.string(),
	frequency: z.string(),
	notes: z.string().nullable().optional(),
	startDate: z.string(),
	endDate: z.string().optional(),
	category: z.string().optional(),
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

export const frequencyOptions = [
	{ value: "1x pe zi", label: "1x pe zi" },
	{ value: "2x pe zi", label: "2x pe zi" },
	{ value: "3x pe zi", label: "3x pe zi" },
	{ value: "4x pe zi", label: "4x pe zi" },
	{ value: "La 2 zile", label: "La 2 zile" },
	{ value: "Săptămânal", label: "Săptămânal" },
	{ value: "Lunar", label: "Lunar" },
] as const;

export const categoryOptions = [
	{ value: "imunosupresor", label: "Imunosupresor" },
	{ value: "antiviral", label: "Antiviral" },
	{ value: "hbig", label: "HB-Ig" },
	{ value: "altele", label: "Altele" },
] as const;

export const suggestedDrugs: Record<string, string[]> = {
	imunosupresor: [
		"Tacrolimus",
		"Ciclosporina",
		"Micofenolat mofetil",
		"Azatioprina",
		"Corticosteroizi",
	],
	antiviral: ["Entecavir", "Tenofovir"],
	hbig: ["HB-Ig"],
	altele: [],
};

export const medicationFormSchema = z.object({
	name: z.string().min(1, "Câmpul este obligatoriu."),
	dose: z.string().min(1, "Câmpul este obligatoriu."),
	frequency: z.string().min(1, "Câmpul este obligatoriu."),
	notes: z.string().optional(),
	startDate: z.string().min(1, "Câmpul este obligatoriu."),
	endDate: z.string().optional(),
	category: z.string().optional(),
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
