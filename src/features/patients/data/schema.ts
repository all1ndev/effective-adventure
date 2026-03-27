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
	userId: z.string().nullable().optional(),
	doctorId: z.string().nullable().optional(),
	patientCode: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	patientPhone: z.string().optional(),
	sex: z.union([
		z.literal("masculin"),
		z.literal("feminin"),
		z.literal("nespecificat"),
	]),
	age: z.number().min(0).max(130).optional(),
	weightKg: z.number().optional(),
	heightCm: z.number().optional(),
	bmi: z.number().optional(),
	nationality: z.string().optional(),
	preferredLanguage: z
		.enum(["ro", "en", "it", "fr", "de"])
		.nullable()
		.optional(),
	etiology: patientEtiologySchema.optional(),
	etiologyOther: z.string().optional(),
	transplantDate: z.string().optional(),
	donorType: z.enum(["cadaveric", "viu"]).nullable().optional(),
	donorAntiHbc: z
		.enum(["pozitiv", "negativ", "necunoscut"])
		.nullable()
		.optional(),
	donorHbsAg: z
		.enum(["pozitiv", "negativ", "necunoscut"])
		.nullable()
		.optional(),
	rejectionHistory: z.boolean().optional(),
	rejectionDate: z.string().optional(),
	rejectionType: z.enum(["acut", "cronic"]).nullable().optional(),
	majorComplications: z.string().optional(),
	immunosuppressants: z.array(z.string()).optional(),
	antiviralProphylaxis: z.array(z.string()).optional(),
	hbIg: z.boolean().optional(),
	hbIgRoute: z.enum(["iv", "sc"]).nullable().optional(),
	hbIgFrequency: z.string().optional(),
	otherMeds: z.string().optional(),
	status: patientStatusSchema,
});
export type Patient = z.infer<typeof patientSchema>;
export const patientListSchema = z.array(patientSchema);

export const patientFormSchema = z.object({
	firstName: z.string().min(1, "Câmpul este obligatoriu."),
	lastName: z.string().min(1, "Câmpul este obligatoriu."),
	patientPhone: z.string().optional(),
	sex: z.enum(["masculin", "feminin", "nespecificat"]),
	age: z.number().min(0).max(130).optional(),
	etiology: z
		.enum(["HBV", "HDV", "HCV", "MASLD", "alcool", "autoimuna", "altele"])
		.optional(),
	transplantDate: z.string().optional(),
	status: z.enum(["activ", "inactiv"]),
});
export type PatientFormValues = z.infer<typeof patientFormSchema>;

export const editPatientFormSchema = z.object({
	firstName: z.string().min(1, "Câmpul este obligatoriu."),
	lastName: z.string().min(1, "Câmpul este obligatoriu."),
	patientCode: z.string().min(1, "Câmpul este obligatoriu."),
	age: z.number().min(0).max(130).optional(),
	sex: z.enum(["masculin", "feminin", "nespecificat"]),
	weightKg: z.number().min(0).optional(),
	heightCm: z.number().min(0).optional(),
	bmi: z.number().min(0).optional(),
	nationality: z.string().optional(),
	preferredLanguage: z.enum(["ro", "en", "it", "fr", "de"]),
	transplantDate: z.string().optional(),
	etiology: z.enum([
		"HBV",
		"HDV",
		"HCV",
		"MASLD",
		"alcool",
		"autoimuna",
		"altele",
	]),
	etiologyOther: z.string().optional(),
	donorType: z.enum(["cadaveric", "viu"]),
	donorAntiHbc: z.enum(["pozitiv", "negativ", "necunoscut"]),
	donorHbsAg: z.enum(["pozitiv", "negativ", "necunoscut"]),
	rejectionHistory: z.boolean(),
	rejectionDate: z.string().optional(),
	rejectionType: z.enum(["acut", "cronic"]),
	majorComplications: z.string().optional(),
	immunosuppressants: z
		.array(
			z.enum([
				"tacrolimus",
				"ciclosporina",
				"micofenolat",
				"azatioprina",
				"corticosteroizi",
			]),
		)
		.default([]),
	antiviralProphylaxis: z.array(z.enum(["entecavir", "tenofovir"])).default([]),
	hbIg: z.boolean(),
	hbIgRoute: z.enum(["iv", "sc"]),
	hbIgFrequency: z.string().optional(),
	otherMeds: z.string().optional(),
	patientPhone: z.string().optional(),
	doctorAccount: z.string().optional(),
	status: z.enum(["activ", "inactiv"]),
});
export type EditPatientFormValues = z.infer<typeof editPatientFormSchema>;

export const addPatientFormSchema = z.object({
	firstName: z.string().min(1, "Câmpul este obligatoriu."),
	lastName: z.string().min(1, "Câmpul este obligatoriu."),
	patientId: z.string().min(1, "Câmpul este obligatoriu."),
	age: z.number().min(0).max(130).optional(),
	sex: z.enum(["masculin", "feminin", "nespecificat"]),
	weightKg: z.number().min(0).optional(),
	heightCm: z.number().min(0).optional(),
	bmi: z.number().min(0).optional(),
	nationality: z.string().optional(),
	preferredLanguage: z.enum(["ro", "en", "it", "fr", "de"]),
	transplantDate: z.string().optional(),
	etiology: z.enum([
		"HBV",
		"HDV",
		"HCV",
		"MASLD",
		"alcool",
		"autoimuna",
		"altele",
	]),
	etiologyOther: z.string().optional(),
	donorType: z.enum(["cadaveric", "viu"]),
	donorAntiHbc: z.enum(["pozitiv", "negativ", "necunoscut"]),
	donorHbsAg: z.enum(["pozitiv", "negativ", "necunoscut"]),
	rejectionHistory: z.boolean(),
	rejectionDate: z.string().optional(),
	rejectionType: z.enum(["acut", "cronic"]),
	majorComplications: z.string().optional(),
	immunosuppressants: z
		.array(
			z.enum([
				"tacrolimus",
				"ciclosporina",
				"micofenolat",
				"azatioprina",
				"corticosteroizi",
			]),
		)
		.default([]),
	antiviralProphylaxis: z.array(z.enum(["entecavir", "tenofovir"])).default([]),
	hbIg: z.boolean(),
	hbIgRoute: z.enum(["iv", "sc"]),
	hbIgFrequency: z.string().optional(),
	otherMeds: z.string().optional(),
	patientPhone: z.string().optional(),
	patientEmail: z
		.string()
		.email("Adresa de email invalida.")
		.min(1, "Câmpul este obligatoriu."),
	patientPassword: z
		.string()
		.min(6, "Parola trebuie sa aiba cel putin 6 caractere."),
	doctorAccount: z.string().min(1, "Câmpul este obligatoriu."),
});
export type AddPatientFormValues = z.infer<typeof addPatientFormSchema>;
