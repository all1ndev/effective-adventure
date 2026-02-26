import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { showSubmittedData } from "@/lib/show-submitted-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const profileFormSchema = z.object({
	username: z
		.string("Introduceți numele de utilizator.")
		.min(2, "Numele de utilizator trebuie să aibă cel puțin 2 caractere.")
		.max(30, "Numele de utilizator nu poate depăși 30 de caractere."),
	email: z.email({
		error: (iss) =>
			iss.input === undefined
				? "Selectați un e-mail pentru afișare."
				: undefined,
	}),
	bio: z.string().max(160).min(4),
	urls: z
		.array(
			z.object({
				value: z.url("Introduceți un URL valid."),
			}),
		)
		.optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
	bio: "I own a computer.",
	urls: [
		{ value: "https://shadcn.com" },
		{ value: "http://twitter.com/shadcn" },
	],
};

export function ProfileForm() {
	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues,
		mode: "onChange",
	});

	const { fields, append } = useFieldArray({
		name: "urls",
		control: form.control,
	});

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit((data) => showSubmittedData(data))}
				className="space-y-8"
			>
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nume utilizator</FormLabel>
							<FormControl>
								<Input placeholder="shadcn" {...field} />
							</FormControl>
							<FormDescription>
								This is your public display name. It can be your real name or a
								pseudonym. You can only change this once every 30 days.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>E-mail</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Selectați un e-mail verificat" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="m@example.com">m@example.com</SelectItem>
									<SelectItem value="m@google.com">m@google.com</SelectItem>
									<SelectItem value="m@support.com">m@support.com</SelectItem>
								</SelectContent>
							</Select>
							<FormDescription>
								You can manage verified email addresses in your{" "}
								<Link href="/">email settings</Link>.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="bio"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Biografie</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Spune-ne puțin despre tine"
									className="resize-none"
									{...field}
								/>
							</FormControl>
							<FormDescription>
								You can <span>@mention</span> other users and organizations to
								link to them.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div>
					{fields.map((field, index) => (
						<FormField
							control={form.control}
							key={field.id}
							name={`urls.${index}.value`}
							render={({ field }) => (
								<FormItem>
									<FormLabel className={cn(index !== 0 && "sr-only")}>
										URLs
									</FormLabel>
									<FormDescription className={cn(index !== 0 && "sr-only")}>
										Adaugă linkuri către site-ul tău, blog sau profiluri
										sociale.
									</FormDescription>
									<FormControl className={cn(index !== 0 && "mt-1.5")}>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					))}
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="mt-2"
						onClick={() => append({ value: "" })}
					>
						Add URL
					</Button>
				</div>
				<Button type="submit">Actualizează profilul</Button>
			</form>
		</Form>
	);
}
