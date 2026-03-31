"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { symptomOptions } from "../data/symptom-options";
import {
	symptomReportFormSchema,
	type SymptomReportFormValues,
} from "../data/schema";
import { createSymptomReport, updateSymptomReport } from "../actions";

interface SymptomsFormProps {
	editId?: string;
	defaultValues?: SymptomReportFormValues;
	onSuccess?: () => void;
}

export function SymptomsForm({
	editId,
	defaultValues,
	onSuccess,
}: SymptomsFormProps) {
	const [isPending, startTransition] = useTransition();
	const [submitted, setSubmitted] = useState(false);

	const form = useForm<SymptomReportFormValues>({
		resolver: zodResolver(symptomReportFormSchema),
		defaultValues: defaultValues ?? {
			symptoms: [],
			severity: undefined as unknown as SymptomReportFormValues["severity"],
			notes: "",
		},
	});

	function onSubmit(values: SymptomReportFormValues) {
		startTransition(async () => {
			const result = editId
				? await updateSymptomReport(editId, values)
				: await createSymptomReport(values);

			if (result.error) {
				toast.error(result.error);
				return;
			}

			toast.success(
				editId
					? "Raportul a fost actualizat cu succes."
					: "Simptomele au fost raportate cu succes.",
			);
			form.reset({
				symptoms: [],
				severity: undefined as unknown as SymptomReportFormValues["severity"],
				notes: "",
			});
			setSubmitted(true);
			setTimeout(() => setSubmitted(false), 4000);
			onSuccess?.();
		});
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{editId ? "Editeaza raport simptome" : "Raporteaza simptome"}
				</CardTitle>
				<CardDescription>
					Selectati simptomele pe care le resimtiti astazi.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{submitted && (
					<div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
						{editId
							? "Raportul a fost actualizat cu succes."
							: "Simptomele au fost raportate cu succes."}
					</div>
				)}
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="symptoms"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Simptome</FormLabel>
									<div className="grid gap-3 sm:grid-cols-2">
										{symptomOptions.map((symptom) => (
											<div
												key={symptom}
												className="flex items-center space-x-2"
											>
												<Checkbox
													id={symptom}
													checked={field.value.includes(symptom)}
													onCheckedChange={(checked) => {
														field.onChange(
															checked
																? [...field.value, symptom]
																: field.value.filter((s) => s !== symptom),
														);
													}}
												/>
												<label
													htmlFor={symptom}
													className="cursor-pointer text-sm font-normal"
												>
													{symptom}
												</label>
											</div>
										))}
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="severity"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Severitate</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value ?? ""}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Selectati severitatea" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="usoara">Usoara</SelectItem>
											<SelectItem value="moderata">Moderata</SelectItem>
											<SelectItem value="severa">Severa</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Note suplimentare</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Descrieti mai detaliat ce simtiti..."
											rows={3}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" disabled={isPending}>
							{isPending
								? "Se salveaza..."
								: editId
									? "Actualizeaza"
									: "Trimite raport"}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
