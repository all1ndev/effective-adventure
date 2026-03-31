import { z } from "zod";

const doctorStatusSchema = z.union([z.literal("activ"), z.literal("inactiv")]);
export type DoctorStatus = z.infer<typeof doctorStatusSchema>;

export const doctorSchema = z.object({
	id: z.string(),
	userId: z.string().nullable().optional(),
	firstName: z.string(),
	lastName: z.string(),
	email: z.string().optional(),
	specialization: z.string().nullable().optional(),
	phone: z.string().nullable().optional(),
	licenseNumber: z.string().nullable().optional(),
	status: doctorStatusSchema,
});
export type Doctor = z.infer<typeof doctorSchema>;

export const addDoctorFormSchema = z.object({
	firstName: z.string().min(1, "Câmpul este obligatoriu."),
	lastName: z.string().min(1, "Câmpul este obligatoriu."),
	email: z
		.string()
		.email("Adresa de email invalidă.")
		.min(1, "Câmpul este obligatoriu."),
	password: z.string().min(7, "Parola trebuie să aibă cel puțin 7 caractere."),
	specialization: z.string().optional(),
	phone: z.string().optional(),
	licenseNumber: z.string().optional(),
});
export type AddDoctorFormValues = z.infer<typeof addDoctorFormSchema>;

export const editDoctorFormSchema = z.object({
	firstName: z.string().min(1, "Câmpul este obligatoriu."),
	lastName: z.string().min(1, "Câmpul este obligatoriu."),
	specialization: z.string().optional(),
	phone: z.string().optional(),
	licenseNumber: z.string().optional(),
	status: z.enum(["activ", "inactiv"]),
});
export type EditDoctorFormValues = z.infer<typeof editDoctorFormSchema>;
