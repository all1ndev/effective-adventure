import Link from "next/link";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AuthLayout } from "../auth-layout";
import { OtpForm } from "./components/otp-form";

export function Otp() {
	return (
		<AuthLayout>
			<Card className="gap-4">
				<CardHeader>
					<CardTitle className="text-base tracking-tight">
						Autentificare în doi pași
					</CardTitle>
					<CardDescription>
						Introduceți codul de autentificare. <br /> Am trimis codul pe adresa
						dvs. de e-mail.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<OtpForm />
				</CardContent>
				<CardFooter>
					<p className="px-8 text-center text-sm text-muted-foreground">
						Nu l-ați primit?{" "}
						<Link
							href="/sign-in"
							className="underline underline-offset-4 hover:text-primary"
						>
							Retrimiteți un cod nou.
						</Link>
						.
					</p>
				</CardFooter>
			</Card>
		</AuthLayout>
	);
}
