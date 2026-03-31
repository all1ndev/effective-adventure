import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

interface SendEmailOptions {
	to: string;
	subject: string;
	html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
	await transporter.sendMail({
		from: `"LiverCare" <${process.env.EMAIL_USER}>`,
		to,
		subject,
		html,
	});
}

export function sendCredentialsEmail({
	to,
	name,
	role,
	password,
	loginUrl,
}: {
	to: string;
	name: string;
	role: "medic" | "pacient";
	password: string;
	loginUrl: string;
}) {
	const roleLabel = role === "medic" ? "medic" : "pacient";
	return sendEmail({
		to,
		subject: `Contul tău de ${roleLabel} a fost creat`,
		html: `
			<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
				<h2>Bună ziua, ${name}!</h2>
				<p>Contul tău de <strong>${roleLabel}</strong> a fost creat cu succes.</p>
				<p>Iată datele tale de autentificare:</p>
				<table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
					<tr>
						<td style="padding: 8px 12px; border: 1px solid #ddd; font-weight: bold;">Email</td>
						<td style="padding: 8px 12px; border: 1px solid #ddd;">${to}</td>
					</tr>
					<tr>
						<td style="padding: 8px 12px; border: 1px solid #ddd; font-weight: bold;">Parolă</td>
						<td style="padding: 8px 12px; border: 1px solid #ddd; font-family: monospace;">${password}</td>
					</tr>
				</table>
				<p>
					<a href="${loginUrl}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">
						Autentifică-te
					</a>
				</p>
				<p style="color: #666; font-size: 14px;">
					Îți recomandăm să îți schimbi parola după prima autentificare.
				</p>
			</div>
		`,
	});
}
