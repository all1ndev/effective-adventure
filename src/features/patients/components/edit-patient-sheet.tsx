"use client";

import { useEffect, useState, useTransition } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertCircle, Trash2 } from "lucide-react";
import { updateFullPatient, deletePatient } from "../actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { type Patient } from "../data/schema";
import { frequencyOptions } from "@/features/medication/data/schema";

const sexValues = ["masculin", "feminin", "nespecificat"] as const;
const languageValues = ["ro", "en", "it", "fr", "de"] as const;
const etiologyValues = [
	"HBV",
	"HDV",
	"HCV",
	"MASLD",
	"alcool",
	"autoimuna",
	"altele",
] as const;
const donorTypeValues = ["cadaveric", "viu"] as const;
const donorStatusValues = ["pozitiv", "negativ", "necunoscut"] as const;
const rejectionTypeValues = ["acut", "cronic"] as const;
const immunosuppressantValues = [
	"tacrolimus",
	"ciclosporina",
	"micofenolat",
	"azatioprina",
	"corticosteroizi",
] as const;
const antiviralValues = ["entecavir", "tenofovir"] as const;
const hbIgRouteValues = ["iv", "sc"] as const;

const patientFormSchema = z.object({
	firstName: z.string().min(1, "Câmpul este obligatoriu."),
	lastName: z.string().min(1, "Câmpul este obligatoriu."),
	patientCode: z.string().min(1, "Câmpul este obligatoriu."),
	age: z.number().min(0).max(130).optional(),
	sex: z.enum(sexValues),
	weightKg: z.number().min(0).optional(),
	heightCm: z.number().min(0).optional(),
	bmi: z.number().min(0).optional(),
	nationality: z.string().optional(),
	preferredLanguage: z.enum(languageValues),
	transplantDate: z.string().optional(),
	etiology: z.enum(etiologyValues),
	etiologyOther: z.string().optional(),
	donorType: z.enum(donorTypeValues),
	donorAntiHbc: z.enum(donorStatusValues),
	donorHbsAg: z.enum(donorStatusValues),
	rejectionHistory: z.boolean(),
	rejectionDate: z.string().optional(),
	rejectionType: z.enum(rejectionTypeValues),
	majorComplications: z.string().optional(),
	immunosuppressants: z.array(z.enum(immunosuppressantValues)).default([]),
	immunosuppressantDetails: z
		.record(
			z.string(),
			z.object({
				frequency: z.string().optional(),
				notes: z.string().optional(),
			}),
		)
		.default({}),
	antiviralProphylaxis: z.array(z.enum(antiviralValues)).default([]),
	antiviralDetails: z
		.record(
			z.string(),
			z.object({
				frequency: z.string().optional(),
				notes: z.string().optional(),
			}),
		)
		.default({}),
	hbIg: z.boolean(),
	hbIgRoute: z.enum(hbIgRouteValues),
	hbIgFrequency: z.string().optional(),
	otherMeds: z.string().optional(),
	patientPhone: z.string().min(1, "Câmpul este obligatoriu."),
	doctorAccount: z.string().optional(),
	status: z.enum(["activ", "inactiv"]),
});

type PatientFormValues = z.input<typeof patientFormSchema>;

function updateNumberField(
	value: string,
	onChange: (value: number | undefined) => void,
) {
	if (value === "") {
		onChange(undefined);
		return;
	}
	const parsed = Number(value);
	onChange(Number.isNaN(parsed) ? undefined : parsed);
}

function safeEnum<T extends string>(
	value: string | null | undefined,
	allowed: readonly T[],
	fallback: T,
): T {
	if (!value) return fallback;
	return (allowed as readonly string[]).includes(value)
		? (value as T)
		: fallback;
}

function patientToFormValues(p: Patient): PatientFormValues {
	return {
		firstName: p.firstName,
		lastName: p.lastName,
		patientCode: p.patientCode ?? p.id,
		age: p.age ?? undefined,
		sex: p.sex,
		weightKg: p.weightKg ?? undefined,
		heightCm: p.heightCm ?? undefined,
		bmi: p.bmi ?? undefined,
		nationality: p.nationality ?? "",
		preferredLanguage: safeEnum(p.preferredLanguage, languageValues, "ro"),
		transplantDate: p.transplantDate ?? "",
		etiology: safeEnum(p.etiology, etiologyValues, "HBV"),
		etiologyOther: p.etiologyOther ?? "",
		donorType: safeEnum(p.donorType, donorTypeValues, "cadaveric"),
		donorAntiHbc: safeEnum(p.donorAntiHbc, donorStatusValues, "necunoscut"),
		donorHbsAg: safeEnum(p.donorHbsAg, donorStatusValues, "necunoscut"),
		rejectionHistory: p.rejectionHistory ?? false,
		rejectionDate: p.rejectionDate ?? "",
		rejectionType: safeEnum(p.rejectionType, rejectionTypeValues, "acut"),
		majorComplications: p.majorComplications ?? "",
		immunosuppressants: ((p.immunosuppressants ?? []) as string[]).filter(
			(v): v is (typeof immunosuppressantValues)[number] =>
				(immunosuppressantValues as readonly string[]).includes(v),
		),
		immunosuppressantDetails:
			(p.immunosuppressantDetails as Record<
				string,
				{ frequency?: string; notes?: string }
			>) ?? {},
		antiviralProphylaxis: ((p.antiviralProphylaxis ?? []) as string[]).filter(
			(v): v is (typeof antiviralValues)[number] =>
				(antiviralValues as readonly string[]).includes(v),
		),
		antiviralDetails:
			(p.antiviralDetails as Record<
				string,
				{ frequency?: string; notes?: string }
			>) ?? {},
		hbIg: p.hbIg ?? false,
		hbIgRoute: safeEnum(p.hbIgRoute, hbIgRouteValues, "iv"),
		hbIgFrequency: p.hbIgFrequency ?? "",
		otherMeds: p.otherMeds ?? "",
		patientPhone: p.patientPhone ?? "",
		doctorAccount: p.doctorId ?? "",
		status: p.status,
	};
}

interface Admin {
	id: string;
	name: string;
	email: string;
}

interface EditPatientSheetProps {
	patient: Patient | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	admins: Admin[];
	onSaved?: () => void;
}

export function EditPatientSheet({
	patient,
	open,
	onOpenChange,
	admins,
	onSaved,
}: EditPatientSheetProps) {
	const [isPending, startTransition] = useTransition();
	const [isDeleting, startDeleteTransition] = useTransition();
	const [submitError, setSubmitError] = useState<string | null>(null);

	const form = useForm<PatientFormValues>({
		resolver: zodResolver(patientFormSchema),
		defaultValues: patient ? patientToFormValues(patient) : undefined,
	});

	useEffect(() => {
		if (patient && open) {
			form.reset(patientToFormValues(patient));
		}
	}, [patient, open, form]);

	function handleOpenChange(nextOpen: boolean) {
		if (nextOpen) setSubmitError(null);
		onOpenChange(nextOpen);
	}

	const weight = useWatch({ control: form.control, name: "weightKg" });
	const height = useWatch({ control: form.control, name: "heightCm" });
	const rejectionHistory = useWatch({
		control: form.control,
		name: "rejectionHistory",
	});
	const hbIg = useWatch({ control: form.control, name: "hbIg" });
	const etiology = useWatch({ control: form.control, name: "etiology" });
	const selectedImmunosuppressants = useWatch({
		control: form.control,
		name: "immunosuppressants",
	});
	const selectedAntivirals = useWatch({
		control: form.control,
		name: "antiviralProphylaxis",
	});
	const immuDetails = useWatch({
		control: form.control,
		name: "immunosuppressantDetails",
	});
	const avDetails = useWatch({
		control: form.control,
		name: "antiviralDetails",
	});

	const formErrors = form.formState.errors;
	const hasValidationErrors =
		form.formState.isSubmitted && Object.keys(formErrors).length > 0;

	useEffect(() => {
		if (!weight || !height) {
			if (form.getValues("bmi") !== undefined) {
				form.setValue("bmi", undefined);
			}
			return;
		}
		const heightMeters = height / 100;
		if (heightMeters <= 0) return;
		const bmiValue = weight / (heightMeters * heightMeters);
		const rounded = Number(bmiValue.toFixed(1));
		if (form.getValues("bmi") !== rounded) {
			form.setValue("bmi", rounded);
		}
	}, [form, height, weight]);

	if (!patient) return null;

	function handleDelete() {
		if (!patient) return;
		startDeleteTransition(async () => {
			const result = await deletePatient(patient.id);
			if (!result.success) {
				setSubmitError(result.error ?? "Eroare necunoscută");
				toast.error(result.error ?? "Eroare la ștergerea pacientului");
				return;
			}
			toast.success("Pacientul a fost șters cu succes!");
			onOpenChange(false);
			onSaved?.();
		});
	}

	function onSubmit(data: PatientFormValues) {
		if (!patient) return;
		setSubmitError(null);
		startTransition(async () => {
			const result = await updateFullPatient(patient.id, data);

			if (!result.success) {
				setSubmitError(result.error ?? "Eroare necunoscuta");
				toast.error(result.error ?? "Eroare la actualizarea pacientului");
				return;
			}

			toast.success("Datele pacientului au fost actualizate!");
			onOpenChange(false);
			onSaved?.();
		});
	}

	function onInvalid() {
		toast.error("Completati toate campurile obligatorii.");
	}

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<SheetContent
				side="right"
				className="sm:max-w-2xl w-full overflow-y-auto"
			>
				<SheetHeader>
					<SheetTitle>
						Editare pacient — {patient.lastName} {patient.firstName}
					</SheetTitle>
					<SheetDescription>
						Modificati datele pacientului si salvati.
					</SheetDescription>
				</SheetHeader>

				<div className="px-4 pb-6">
					{hasValidationErrors && (
						<Alert variant="destructive" className="mb-6">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Campuri obligatorii necompletate</AlertTitle>
							<AlertDescription>
								<ul className="mt-1 list-disc pl-4">
									{Object.entries(formErrors)
										.filter(([, err]) => typeof err?.message === "string")
										.map(([key, err]) => (
											<li key={key} className="font-medium">
												{(err?.message as string) ?? key}
											</li>
										))}
								</ul>
							</AlertDescription>
						</Alert>
					)}

					{submitError && (
						<Alert variant="destructive" className="mb-6">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Eroare la salvare</AlertTitle>
							<AlertDescription>{submitError}</AlertDescription>
						</Alert>
					)}

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit, onInvalid)}
							className="space-y-8"
						>
							<section className="space-y-4">
								<h2 className="text-lg font-semibold">Conturi</h2>
								<div className="grid gap-4 md:grid-cols-2">
									<FormField
										control={form.control}
										name="patientPhone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Număr de telefon *</FormLabel>
												<FormControl>
													<Input
														type="tel"
														placeholder="Ex: 07xx xxx xxx"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="doctorAccount"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Medic responsabil</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Selecteaza medicul" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{admins.map((admin) => (
															<SelectItem key={admin.id} value={admin.id}>
																{admin.name} ({admin.email})
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</section>

							<Separator />

							<section className="space-y-4">
								<h2 className="text-lg font-semibold">Profil pacient</h2>
								<div className="grid gap-4 md:grid-cols-2">
									<FormField
										control={form.control}
										name="firstName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Prenume <span className="text-destructive">*</span>
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Prenumele pacientului"
														className={
															formErrors.firstName ? "border-destructive" : ""
														}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="lastName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Nume <span className="text-destructive">*</span>
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Numele pacientului"
														className={
															formErrors.lastName ? "border-destructive" : ""
														}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="grid gap-4 md:grid-cols-3">
									<FormField
										control={form.control}
										name="patientCode"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													ID pacient <span className="text-destructive">*</span>
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Cod intern / initiale"
														className={
															formErrors.patientCode ? "border-destructive" : ""
														}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="age"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Varsta</FormLabel>
												<FormControl>
													<Input
														type="number"
														min={0}
														placeholder="Ani"
														value={field.value ?? ""}
														onChange={(event) =>
															updateNumberField(
																event.target.value,
																field.onChange,
															)
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="sex"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Sex</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Selecteaza" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="masculin">Masculin</SelectItem>
														<SelectItem value="feminin">Feminin</SelectItem>
														<SelectItem value="nespecificat">
															Nespecificat
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="grid gap-4 md:grid-cols-4">
									<FormField
										control={form.control}
										name="weightKg"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Greutate</FormLabel>
												<FormControl>
													<Input
														type="number"
														min={0}
														placeholder="kg"
														value={field.value ?? ""}
														onChange={(event) =>
															updateNumberField(
																event.target.value,
																field.onChange,
															)
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="heightCm"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Inaltime</FormLabel>
												<FormControl>
													<Input
														type="number"
														min={0}
														placeholder="cm"
														value={field.value ?? ""}
														onChange={(event) =>
															updateNumberField(
																event.target.value,
																field.onChange,
															)
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="bmi"
										render={({ field }) => (
											<FormItem>
												<FormLabel>BMI</FormLabel>
												<FormControl>
													<Input
														value={field.value ?? ""}
														placeholder="Calculat automat"
														readOnly
														disabled
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="nationality"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nationalitate</FormLabel>
												<FormControl>
													<Input placeholder="Ex: romana" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="preferredLanguage"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Limba preferata</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Selecteaza" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="ro">Romana</SelectItem>
														<SelectItem value="en">Engleza</SelectItem>
														<SelectItem value="it">Italiana</SelectItem>
														<SelectItem value="fr">Franceza</SelectItem>
														<SelectItem value="de">Germana</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<FormField
									control={form.control}
									name="status"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Status pacient</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<FormControl>
													<SelectTrigger className="w-full md:w-1/2">
														<SelectValue placeholder="Selecteaza" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="activ">Activ</SelectItem>
													<SelectItem value="inactiv">Inactiv</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</section>

							<Separator />

							<section className="space-y-4">
								<h2 className="text-lg font-semibold">Transplant hepatic</h2>
								<div className="grid gap-4 md:grid-cols-2">
									<FormField
										control={form.control}
										name="transplantDate"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Data transplantului hepatic</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="etiology"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Etiologia bolii hepatice</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Selecteaza" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="HBV">HBV</SelectItem>
														<SelectItem value="HDV">HDV</SelectItem>
														<SelectItem value="HCV">HCV</SelectItem>
														<SelectItem value="MASLD">MASLD</SelectItem>
														<SelectItem value="alcool">Alcool</SelectItem>
														<SelectItem value="autoimuna">Autoimuna</SelectItem>
														<SelectItem value="altele">Altele</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									{etiology === "altele" && (
										<FormField
											control={form.control}
											name="etiologyOther"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Etiologie - alte detalii</FormLabel>
													<FormControl>
														<Input
															placeholder="Specificati etiologia"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}
								</div>
								<div className="grid gap-4 md:grid-cols-3">
									<FormField
										control={form.control}
										name="donorType"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Tip donator</FormLabel>
												<FormControl>
													<RadioGroup
														onValueChange={field.onChange}
														value={field.value}
														className="flex flex-col gap-2"
													>
														<FormItem className="flex items-center gap-2">
															<FormControl>
																<RadioGroupItem value="cadaveric" />
															</FormControl>
															<FormLabel className="font-normal">
																Cadaveric
															</FormLabel>
														</FormItem>
														<FormItem className="flex items-center gap-2">
															<FormControl>
																<RadioGroupItem value="viu" />
															</FormControl>
															<FormLabel className="font-normal">Viu</FormLabel>
														</FormItem>
													</RadioGroup>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="donorAntiHbc"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Status donator anti-HBc</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Selecteaza" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="pozitiv">Pozitiv</SelectItem>
														<SelectItem value="negativ">Negativ</SelectItem>
														<SelectItem value="necunoscut">
															Necunoscut
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="donorHbsAg"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Status donator HBsAg</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Selecteaza" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="pozitiv">Pozitiv</SelectItem>
														<SelectItem value="negativ">Negativ</SelectItem>
														<SelectItem value="necunoscut">
															Necunoscut
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="grid gap-4 md:grid-cols-3">
									<FormField
										control={form.control}
										name="rejectionHistory"
										render={({ field }) => (
											<FormItem className="flex items-center justify-between rounded-lg border p-4">
												<div>
													<FormLabel>Rejet in antecedente</FormLabel>
													<FormDescription>
														Indicati daca au existat episoade de rejet.
													</FormDescription>
												</div>
												<FormControl>
													<Switch
														checked={field.value}
														onCheckedChange={field.onChange}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
									{rejectionHistory && (
										<FormField
											control={form.control}
											name="rejectionDate"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Data rejet</FormLabel>
													<FormControl>
														<Input type="date" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}
									{rejectionHistory && (
										<FormField
											control={form.control}
											name="rejectionType"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Tip rejet</FormLabel>
													<Select
														onValueChange={field.onChange}
														value={field.value}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Selecteaza" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="acut">Acut</SelectItem>
															<SelectItem value="cronic">Cronic</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}
								</div>
								<FormField
									control={form.control}
									name="majorComplications"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Complicatii majore post-LT</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Ex: tromboza artera hepatica, stenoza biliara, infectii severe"
													className="min-h-[100px]"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</section>

							<Separator />

							<section className="space-y-4">
								<h2 className="text-lg font-semibold">Schema terapeutica</h2>
								<div className="grid gap-4 md:grid-cols-2">
									<FormField
										control={form.control}
										name="immunosuppressants"
										render={() => (
											<FormItem>
												<FormLabel>Imunosupresoare</FormLabel>
												<div className="grid gap-3">
													{immunosuppressantValues.map((item) => (
														<FormField
															key={item}
															control={form.control}
															name="immunosuppressants"
															render={({ field }) => (
																<FormItem className="flex items-center gap-2">
																	<FormControl>
																		<Checkbox
																			checked={field.value?.includes(item)}
																			onCheckedChange={(checked) => {
																				const current = field.value ?? [];
																				return checked === true
																					? field.onChange([...current, item])
																					: field.onChange(
																							current.filter(
																								(value) => value !== item,
																							),
																						);
																			}}
																		/>
																	</FormControl>
																	<FormLabel className="font-normal">
																		{item.charAt(0).toUpperCase() +
																			item.slice(1)}
																	</FormLabel>
																</FormItem>
															)}
														/>
													))}
												</div>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="antiviralProphylaxis"
										render={() => (
											<FormItem>
												<FormLabel>Profilaxie antivirala</FormLabel>
												<div className="grid gap-3">
													{antiviralValues.map((item) => (
														<FormField
															key={item}
															control={form.control}
															name="antiviralProphylaxis"
															render={({ field }) => (
																<FormItem className="flex items-center gap-2">
																	<FormControl>
																		<Checkbox
																			checked={field.value?.includes(item)}
																			onCheckedChange={(checked) => {
																				const current = field.value ?? [];
																				return checked === true
																					? field.onChange([...current, item])
																					: field.onChange(
																							current.filter(
																								(value) => value !== item,
																							),
																						);
																			}}
																		/>
																	</FormControl>
																	<FormLabel className="font-normal">
																		{item.charAt(0).toUpperCase() +
																			item.slice(1)}
																	</FormLabel>
																</FormItem>
															)}
														/>
													))}
													<FormField
														control={form.control}
														name="hbIg"
														render={({ field }) => (
															<FormItem className="mt-2 flex items-center justify-between rounded-lg border p-3">
																<div>
																	<FormLabel>HBIg</FormLabel>
																	<FormDescription>
																		Activati daca exista profilaxie cu HBIg.
																	</FormDescription>
																</div>
																<FormControl>
																	<Switch
																		checked={field.value}
																		onCheckedChange={field.onChange}
																	/>
																</FormControl>
															</FormItem>
														)}
													/>
												</div>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								{(selectedImmunosuppressants ?? []).length > 0 && (
									<div className="space-y-3">
										<p className="text-sm font-medium text-muted-foreground">
											Detalii imunosupresoare selectate
										</p>
										{(selectedImmunosuppressants ?? []).map((item) => (
											<div
												key={item}
												className="rounded-lg border p-3 space-y-2"
											>
												<p className="text-sm font-medium">
													{item.charAt(0).toUpperCase() + item.slice(1)}
												</p>
												<div className="grid gap-3 sm:grid-cols-2">
													<div className="space-y-1">
														<FormLabel className="text-xs">Frecvență</FormLabel>
														<Select
															value={immuDetails?.[item]?.frequency ?? ""}
															onValueChange={(v) =>
																form.setValue(
																	`immunosuppressantDetails.${item}.frequency`,
																	v,
																)
															}
														>
															<SelectTrigger>
																<SelectValue placeholder="Selectați" />
															</SelectTrigger>
															<SelectContent>
																{frequencyOptions.map((opt) => (
																	<SelectItem key={opt.value} value={opt.value}>
																		{opt.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
													<div className="space-y-1">
														<FormLabel className="text-xs">Notițe</FormLabel>
														<Input
															placeholder="ex: dimineața, pe stomacul gol"
															value={immuDetails?.[item]?.notes ?? ""}
															onChange={(e) =>
																form.setValue(
																	`immunosuppressantDetails.${item}.notes`,
																	e.target.value,
																)
															}
														/>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
								{(selectedAntivirals ?? []).length > 0 && (
									<div className="space-y-3">
										<p className="text-sm font-medium text-muted-foreground">
											Detalii antivirale selectate
										</p>
										{(selectedAntivirals ?? []).map((item) => (
											<div
												key={item}
												className="rounded-lg border p-3 space-y-2"
											>
												<p className="text-sm font-medium">
													{item.charAt(0).toUpperCase() + item.slice(1)}
												</p>
												<div className="grid gap-3 sm:grid-cols-2">
													<div className="space-y-1">
														<FormLabel className="text-xs">Frecvență</FormLabel>
														<Select
															value={avDetails?.[item]?.frequency ?? ""}
															onValueChange={(v) =>
																form.setValue(
																	`antiviralDetails.${item}.frequency`,
																	v,
																)
															}
														>
															<SelectTrigger>
																<SelectValue placeholder="Selectați" />
															</SelectTrigger>
															<SelectContent>
																{frequencyOptions.map((opt) => (
																	<SelectItem key={opt.value} value={opt.value}>
																		{opt.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
													<div className="space-y-1">
														<FormLabel className="text-xs">Notițe</FormLabel>
														<Input
															placeholder="ex: dimineața, pe stomacul gol"
															value={avDetails?.[item]?.notes ?? ""}
															onChange={(e) =>
																form.setValue(
																	`antiviralDetails.${item}.notes`,
																	e.target.value,
																)
															}
														/>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
								{hbIg && (
									<div className="grid gap-4 md:grid-cols-2">
										<FormField
											control={form.control}
											name="hbIgRoute"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Cale administrare HBIg</FormLabel>
													<Select
														onValueChange={field.onChange}
														value={field.value}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Selecteaza" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="iv">IV</SelectItem>
															<SelectItem value="sc">SC</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="hbIgFrequency"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Frecventa HBIg</FormLabel>
													<FormControl>
														<Input
															placeholder="Ex: lunar, la 8 saptamani"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								)}
								<FormField
									control={form.control}
									name="otherMeds"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Alte medicamente importante</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Profilaxie infectioasa (CMV, PCP), antidiabetice, antihipertensive, statine"
													className="min-h-[100px]"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</section>

							<div className="flex flex-wrap justify-between gap-3">
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											type="button"
											variant="destructive"
											disabled={isPending || isDeleting}
										>
											<Trash2 className="mr-2 h-4 w-4" />
											{isDeleting ? "Se șterge..." : "Șterge pacientul"}
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Confirmați ștergerea</AlertDialogTitle>
											<AlertDialogDescription>
												Această acțiune este ireversibilă. Contul pacientului{" "}
												<strong>
													{patient.lastName} {patient.firstName}
												</strong>{" "}
												va fi șters definitiv, împreună cu toate datele medicale
												asociate (medicamente, semne vitale, simptome, rezultate
												laborator, note clinice, jurnal, mesaje).
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Anulează</AlertDialogCancel>
											<AlertDialogAction
												onClick={handleDelete}
												className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
											>
												Șterge definitiv
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
								<div className="flex gap-3">
									<Button
										type="button"
										variant="outline"
										onClick={() => onOpenChange(false)}
										disabled={isPending || isDeleting}
									>
										Anulează
									</Button>
									<Button type="submit" disabled={isPending || isDeleting}>
										{isPending ? "Se salvează..." : "Salvează modificările"}
									</Button>
								</div>
							</div>
						</form>
					</Form>
				</div>
			</SheetContent>
		</Sheet>
	);
}
