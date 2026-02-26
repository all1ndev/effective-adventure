import { type PatientStatus } from "./schema";

export const callTypes = new Map<PatientStatus, string>([
	["activ", "bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200"],
	["inactiv", "bg-neutral-300/40 border-neutral-300"],
]);

export const etiologies = [
	{ label: "HBV", value: "HBV" },
	{ label: "HDV", value: "HDV" },
	{ label: "HCV", value: "HCV" },
	{ label: "MASLD", value: "MASLD" },
	{ label: "Alcool", value: "alcool" },
	{ label: "Autoimuna", value: "autoimuna" },
	{ label: "Altele", value: "altele" },
] as const;
