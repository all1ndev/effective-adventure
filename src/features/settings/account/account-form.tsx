import { z } from "zod";
import { useForm } from "react-hook-form";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { showSubmittedData } from "@/lib/show-submitted-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { DatePicker } from "@/components/date-picker";

const languages = [
	{ label: "English", value: "en" },
	{ label: "French", value: "fr" },
	{ label: "German", value: "de" },
	{ label: "Spanish", value: "es" },
	{ label: "Portuguese", value: "pt" },
	{ label: "Russian", value: "ru" },
	{ label: "Japanese", value: "ja" },
	{ label: "Korean", value: "ko" },
	{ label: "Chinese", value: "zh" },
] as const;

const accountFormSchema = z.object({
	name: z
		.string()
		.min(1, "Introduceți numele dvs.")
		.min(2, "Numele trebuie să aibă cel puțin 2 caractere.")
		.max(30, "Numele nu poate depăși 30 de caractere."),
	dob: z.date("Selectați data nașterii."),
	language: z.string("Selectați o limbă."),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<AccountFormValues> = {
	name: "",
};

export function AccountForm() {
	const form = useForm<AccountFormValues>({
		resolver: zodResolver(accountFormSchema),
		defaultValues,
	});

	function onSubmit(data: AccountFormValues) {
		showSubmittedData(data);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nume</FormLabel>
							<FormControl>
								<Input placeholder="Numele tău" {...field} />
							</FormControl>
							<FormDescription>
								This is the name that will be displayed on your profile and in
								emails.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="dob"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Data nașterii</FormLabel>
							<DatePicker selected={field.value} onSelect={field.onChange} />
							<FormDescription>
								Data nașterii este utilizată pentru a calcula vârsta ta.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="language"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Limbă</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant="outline"
											role="combobox"
											className={cn(
												"w-[200px] justify-between",
												!field.value && "text-muted-foreground",
											)}
										>
											{field.value
												? languages.find(
														(language) => language.value === field.value,
													)?.label
												: "Selectează limba"}
											<CaretSortIcon className="ms-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-[200px] p-0">
									<Command>
										<CommandInput placeholder="Caută limbă..." />
										<CommandEmpty>Nu s-a găsit nicio limbă.</CommandEmpty>
										<CommandGroup>
											<CommandList>
												{languages.map((language) => (
													<CommandItem
														value={language.label}
														key={language.value}
														onSelect={() => {
															form.setValue("language", language.value);
														}}
													>
														<CheckIcon
															className={cn(
																"size-4",
																language.value === field.value
																	? "opacity-100"
																	: "opacity-0",
															)}
														/>
														{language.label}
													</CommandItem>
												))}
											</CommandList>
										</CommandGroup>
									</Command>
								</PopoverContent>
							</Popover>
							<FormDescription>
								Aceasta este limba care va fi utilizată în panoul de control.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit">Actualizează contul</Button>
			</form>
		</Form>
	);
}
