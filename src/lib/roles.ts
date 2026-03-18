export type AppRole = "medic" | "pacient";

interface AuthUser {
	role: string[];
}

export function getUserRole(user: AuthUser | null): AppRole | null {
	if (user?.role.includes("medic")) return "medic";
	if (user?.role.includes("pacient")) return "pacient";
	return null;
}
