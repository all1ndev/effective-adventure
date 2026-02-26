import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
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

const formSchema = z.object({
	email: z.email({
		error: (iss) =>
			iss.input === "" ? "Introduceți adresa de e-mail" : undefined,
	}),
});

export function ForgotPasswordForm({
	className,
	...props
}: React.HTMLAttributes<HTMLFormElement>) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: "" },
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		setIsLoading(true);

		console.log(data);

		toast.promise(sleep(2000), {
			loading: "Se trimite e-mailul...",
			success: () => {
				setIsLoading(false);
				form.reset();
				router.push("/otp");
				return `E-mail trimis la ${data.email}`;
			},
			error: "Eroare",
		});
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={cn("grid gap-2", className)}
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
				<Button className="mt-2" disabled={isLoading}>
					Continue
					{isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
				</Button>
			</form>
		</Form>
	);
}
