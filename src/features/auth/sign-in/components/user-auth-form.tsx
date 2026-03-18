import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { sleep, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";

const formSchema = z.object({
	email: z.email({
		error: (iss) =>
			iss.input === "" ? "Introduceți adresa de e-mail" : undefined,
	}),
	password: z
		.string()
		.min(1, "Introduceți parola")
		.min(7, "Parola trebuie să aibă cel puțin 7 caractere"),
});

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
	redirectTo?: string;
}

export function UserAuthForm({
	className,
	redirectTo,
	...props
}: UserAuthFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [selectedRole, setSelectedRole] = useState<"medic" | "pacient">(
		"pacient",
	);
	const router = useRouter();
	const { auth } = useAuthStore();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		setIsLoading(true);

		toast.promise(sleep(2000), {
			loading: "Conectare în curs...",
			success: () => {
				setIsLoading(false);

				// Mock successful authentication with expiry computed at success time
				const mockUser = {
					accountNo: "ACC001",
					email: data.email,
					role: [selectedRole],
					exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
				};

				// Set user and access token
				auth.setUser(mockUser);
				auth.setAccessToken("mock-access-token");

				// Redirect to the stored location or default to dashboard
				const targetPath = redirectTo || "/";
				router.replace(targetPath);

				return `Bun venit înapoi, ${data.email}!`;
			},
			error: "Eroare",
		});
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={cn("grid gap-3", className)}
				{...props}
			>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>E-mail</FormLabel>
							<FormControl>
								<Input placeholder="nume@exemplu.com" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem className="relative">
							<FormLabel>Parolă</FormLabel>
							<FormControl>
								<PasswordInput placeholder="********" {...field} />
							</FormControl>
							<FormMessage />
							<Link
								href="/forgot-password"
								className="absolute end-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75"
							>
								Ai uitat parola?
							</Link>
						</FormItem>
					)}
				/>
				<div className="grid grid-cols-2 gap-2">
					<Button
						type="button"
						variant={selectedRole === "medic" ? "default" : "outline"}
						onClick={() => setSelectedRole("medic")}
					>
						Medic
					</Button>
					<Button
						type="button"
						variant={selectedRole === "pacient" ? "default" : "outline"}
						onClick={() => setSelectedRole("pacient")}
					>
						Pacient
					</Button>
				</div>
				<Button className="mt-2" disabled={isLoading}>
					{isLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
					Conectare
				</Button>
			</form>
		</Form>
	);
}
