import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@/db";
import { sendEmail } from "@/lib/email";

export const auth = betterAuth({
	trustedOrigins: [
		...(process.env.VERCEL_PROJECT_PRODUCTION_URL
			? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
			: []),
		...(process.env.VERCEL_BRANCH_URL
			? [`https://${process.env.VERCEL_BRANCH_URL}`]
			: []),
		...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
	],
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: "Resetare parolă",
				html: `
					<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
						<h2>Bună ziua, ${user.name}!</h2>
						<p>Ai solicitat resetarea parolei contului tău.</p>
						<p>
							<a href="${url}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">
								Resetează parola
							</a>
						</p>
						<p style="color: #666; font-size: 14px; margin-top: 24px;">
							Dacă nu ai solicitat această resetare, ignoră acest e-mail.
						</p>
					</div>
				`,
			});
		},
	},
	plugins: [admin()],
});
