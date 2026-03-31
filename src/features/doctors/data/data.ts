import { type DoctorStatus } from "./schema";

export const doctorStatusStyles = new Map<DoctorStatus, string>([
	["activ", "bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200"],
	["inactiv", "bg-neutral-300/40 border-neutral-300"],
]);
