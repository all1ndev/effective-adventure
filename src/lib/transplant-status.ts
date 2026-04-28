export function isPreTransplant(
	transplantDate: string | null | undefined,
): boolean {
	if (!transplantDate || transplantDate.trim() === "") return true;
	const parsed = new Date(transplantDate);
	if (Number.isNaN(parsed.getTime())) return true;
	return parsed.getTime() > Date.now();
}

export const PRE_TRANSPLANT_ALLOWED_PATHS = [
	"/",
	"/notifications",
	"/calendar",
	"/messaging",
	"/education",
] as const;

export function isPathAllowedPreTransplant(url: string): boolean {
	return (PRE_TRANSPLANT_ALLOWED_PATHS as readonly string[]).includes(url);
}
