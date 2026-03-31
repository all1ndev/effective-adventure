export type AppRole = "admin" | "doctor" | "user";

export function getUserRole(role: string | undefined | null): AppRole | null {
	if (role === "admin") return "admin";
	if (role === "doctor") return "doctor";
	if (role === "user") return "user";
	return null;
}

export function isMedicRole(role: string | undefined | null): boolean {
	return role === "admin" || role === "doctor";
}
