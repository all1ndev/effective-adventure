import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AuthLayout } from "../auth-layout";
import { UserAuthForm } from "./components/user-auth-form";

export function SignIn() {
	return (
		<AuthLayout>
			<Card className="gap-4">
				<CardHeader>
					<CardTitle className="text-lg tracking-tight">Conectare</CardTitle>
					<CardDescription>
						Introduceți adresa de e-mail și parola <br />
						pentru a vă conecta la cont. <br />
						Nu ai un cont? Contactează administratorul pentru un cont.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<UserAuthForm />
				</CardContent>
				<CardFooter>
					<p className="px-8 text-center text-sm text-muted-foreground">
						Prin conectare, ești de acord cu{" "}
						<a
							href="/terms"
							className="underline underline-offset-4 hover:text-primary"
						>
							Termenii de utilizare
						</a>{" "}
						și{" "}
						<a
							href="/privacy"
							className="underline underline-offset-4 hover:text-primary"
						>
							Politica de confidențialitate
						</a>
						.
					</p>
				</CardFooter>
			</Card>
		</AuthLayout>
	);
}
