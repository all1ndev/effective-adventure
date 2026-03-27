"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
	medicationFormSchema,
	type MedicationFormValues,
} from "../data/schema";
import { createMedication, createMedicationForPatient } from "../actions";

interface MedicationFormProps {
	patientId?: string;
	onSuccess?: () => void;
}

export function MedicationForm({ patientId, onSuccess }: MedicationFormProps) {
	const [isPending, startTransition] = useTransition();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<MedicationFormValues>({
		resolver: zodResolver(medicationFormSchema),
		defaultValues: {
			name: "",
			dose: "",
			frequency: "",
			startDate: "",
			endDate: "",
		},
	});

	function onSubmit(values: MedicationFormValues) {
		startTransition(async () => {
			const result = patientId
				? await createMedicationForPatient(patientId, values)
				: await createMedication(values);

			if (result.error) {
				toast.error(result.error);
				return;
			}

			toast.success("Prescriptia a fost adaugata cu succes.");
			reset();
			onSuccess?.();
		});
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Adauga prescriptie</CardTitle>
				<CardDescription>
					Adaugati un medicament nou in schema pacientului.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="grid gap-4 sm:grid-cols-2"
				>
					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="name">Nume medicament</Label>
						<Input
							id="name"
							placeholder="ex: Tacrolimus"
							{...register("name")}
						/>
						{errors.name && (
							<p className="text-sm text-destructive">{errors.name.message}</p>
						)}
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="dose">Doza</Label>
						<Input id="dose" placeholder="ex: 2 mg" {...register("dose")} />
						{errors.dose && (
							<p className="text-sm text-destructive">{errors.dose.message}</p>
						)}
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="frequency">Frecventa</Label>
						<Input
							id="frequency"
							placeholder="ex: De 2 ori pe zi"
							{...register("frequency")}
						/>
						{errors.frequency && (
							<p className="text-sm text-destructive">
								{errors.frequency.message}
							</p>
						)}
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="startDate">Data incepere</Label>
						<Input id="startDate" type="date" {...register("startDate")} />
						{errors.startDate && (
							<p className="text-sm text-destructive">
								{errors.startDate.message}
							</p>
						)}
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="endDate">Data expirare (optional)</Label>
						<Input id="endDate" type="date" {...register("endDate")} />
					</div>
					<div className="sm:col-span-2">
						<Button type="submit" disabled={isPending}>
							{isPending ? "Se salveaza..." : "Adauga prescriptie"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
