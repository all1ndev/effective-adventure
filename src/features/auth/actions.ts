"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function sendPasswordChangedEmail() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) return;

	const { name, email } = session.user;

	await sendEmail({
		to: email,
		subject: "Parola ta a fost schimbată",
		html: `
			<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
				<h2>Bună ziua, ${name}!</h2>
				<p>Parola contului tău a fost schimbată cu succes.</p>
				<p>Dacă nu ai făcut această modificare, te rugăm să contactezi administratorul cât mai curând posibil.</p>
				<p style="color: #666; font-size: 14px; margin-top: 24px;">
					Acest email a fost trimis automat. Nu răspundeți la acest mesaj.
				</p>
			</div>
		`,
	});
}
