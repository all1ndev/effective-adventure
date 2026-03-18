export type AppRole = "admin" | "user";

export function getUserRole(role: string | undefined | null): AppRole | null {
	if (role === "admin") return "admin";
	if (role === "user") return "user";
	return null;
}
