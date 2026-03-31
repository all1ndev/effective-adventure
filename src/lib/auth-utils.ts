import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getSessionOrThrow() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		throw new Error("Neautorizat");
	}
	return session;
}
