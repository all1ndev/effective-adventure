"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showSubmittedData } from "@/lib/show-submitted-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";

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
	firstName: z.string().min(1, "Prenumele este obligatoriu."),
	lastName: z.string().min(1, "Numele este obligatoriu."),
	patientId: z.string().min(1, "ID pacient este obligatoriu."),
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
	antiviralProphylaxis: z.array(z.enum(antiviralValues)).default([]),
	hbIg: z.boolean(),
	hbIgRoute: z.enum(hbIgRouteValues),
	hbIgFrequency: z.string().optional(),
	otherMeds: z.string().optional(),
	patientPhone: z.string().optional(),
	patientPassword: z
		.string()
		.min(6, "Parola trebuie sa aiba cel putin 6 caractere.")
		.optional(),
	doctorAccount: z.string().optional(),
});

type PatientFormValues = z.input<typeof patientFormSchema>;

const defaultValues: PatientFormValues = {
	firstName: "",
	lastName: "",
	patientId: "",
	age: undefined,
	sex: "nespecificat",
	weightKg: undefined,
	heightCm: undefined,
	bmi: undefined,
	nationality: "",
	preferredLanguage: "ro",
	transplantDate: "",
	etiology: "HBV",
	etiologyOther: "",
	donorType: "cadaveric",
	donorAntiHbc: "necunoscut",
	donorHbsAg: "necunoscut",
	rejectionHistory: false,
	rejectionDate: "",
	rejectionType: "acut",
	majorComplications: "",
	immunosuppressants: [],
	antiviralProphylaxis: [],
	hbIg: false,
	hbIgRoute: "iv",
	hbIgFrequency: "",
	otherMeds: "",
	patientPhone: "",
	patientPassword: "",
	doctorAccount: "",
};

const recentPatients = [
	{
		name: "Maria I.",
		id: "MI-024",
		etiology: "HBV",
		date: "2025-11-18",
		status: "Stabil",
		avatar: "/avatars/02.png",
	},
	{
		name: "Andrei C.",
		id: "AC-031",
		etiology: "MASLD",
		date: "2024-08-05",
		status: "Monitorizare",
		avatar: "/avatars/04.png",
	},
	{
		name: "Elena R.",
		id: "ER-019",
		etiology: "Autoimuna",
		date: "2023-12-12",
		status: "Stabil",
		avatar: "/avatars/05.png",
	},
];

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

export function DoctorPatients() {
	const form = useForm<PatientFormValues>({
		resolver: zodResolver(patientFormSchema),
		defaultValues,
	});

	const weight = useWatch({ control: form.control, name: "weightKg" });
	const height = useWatch({ control: form.control, name: "heightCm" });
	const rejectionHistory = useWatch({
		control: form.control,
		name: "rejectionHistory",
	});
	const hbIg = useWatch({ control: form.control, name: "hbIg" });
	const etiology = useWatch({ control: form.control, name: "etiology" });

	useEffect(() => {
		if (!weight || !height) {
			if (form.getValues("bmi") !== undefined) {
				form.setValue("bmi", undefined);
			}
			return;
		}
		const heightMeters = height / 100;
		if (heightMeters <= 0) {
			return;
		}
		const bmiValue = weight / (heightMeters * heightMeters);
		const rounded = Number(bmiValue.toFixed(1));
		if (form.getValues("bmi") !== rounded) {
			form.setValue("bmi", rounded);
		}
	}, [form, height, weight]);

	return (
		<>
			<Header>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					<ConfigDrawer />
					<ProfileDropdown />
				</div>
			</Header>

			<Main className="flex flex-1 flex-col gap-6">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Panou medic - adaugare pacient
					</h1>
					<p className="text-muted-foreground">
						Seteaza profilul pacientului si detaliile initiale despre
						transplantul hepatic.
					</p>
				</div>

				<div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
					<Card>
						<CardHeader>
							<CardTitle>Fisa initiala pacient</CardTitle>
						</CardHeader>
						<CardContent>
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit((data) =>
										showSubmittedData(data, "Date pacient initiale"),
									)}
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
														<FormLabel>Numar de telefon</FormLabel>
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
														<FormLabel>Medic responsabil (Admin)</FormLabel>
														<FormControl>
															<Input
																placeholder="nume.medic@spital.ro"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
										<FormField
											control={form.control}
											name="patientPassword"
											render={({ field }) => (
												<FormItem className="md:w-1/2">
													<FormLabel>Creare parola</FormLabel>
													<FormControl>
														<Input
															type="password"
															placeholder="Minim 6 caractere"
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
										<h2 className="text-lg font-semibold">Profil pacient</h2>
										<div className="grid gap-4 md:grid-cols-2">
											<FormField
												control={form.control}
												name="firstName"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Prenume</FormLabel>
														<FormControl>
															<Input
																placeholder="Prenumele pacientului"
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
														<FormLabel>Nume</FormLabel>
														<FormControl>
															<Input
																placeholder="Numele pacientului"
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
												name="patientId"
												render={({ field }) => (
													<FormItem>
														<FormLabel>ID pacient</FormLabel>
														<FormControl>
															<Input
																placeholder="Cod intern / initiale"
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
																<SelectItem value="masculin">
																	Masculin
																</SelectItem>
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
									</section>

									<Separator />

									<section className="space-y-4">
										<h2 className="text-lg font-semibold">
											Transplant hepatic
										</h2>
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
																<SelectItem value="autoimuna">
																	Autoimuna
																</SelectItem>
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
																defaultValue={field.value}
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
																	<FormLabel className="font-normal">
																		Viu
																	</FormLabel>
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
										<h2 className="text-lg font-semibold">
											Schema terapeutica
										</h2>
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
																							? field.onChange([
																									...current,
																									item,
																								])
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
																							? field.onChange([
																									...current,
																									item,
																								])
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

									<div className="flex flex-wrap gap-3">
										<Button type="submit">Salveaza pacient</Button>
										<Button
											type="button"
											variant="outline"
											onClick={() => form.reset(defaultValues)}
										>
											Reseteaza formularul
										</Button>
									</div>
								</form>
							</Form>
						</CardContent>
					</Card>

					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Pacienti recenti</CardTitle>
								<CardDescription>
									Ultimii pacienti adaugati de echipa medicala.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{recentPatients.map((patient) => (
									<div
										key={patient.id}
										className="flex items-center justify-between gap-4"
									>
										<div className="flex items-center gap-3">
											<Avatar className="h-10 w-10">
												<AvatarImage src={patient.avatar} alt={patient.name} />
												<AvatarFallback>
													{patient.name
														.split(" ")
														.map((part) => part[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
											<div>
												<p className="text-sm font-semibold">{patient.name}</p>
												<p className="text-xs text-muted-foreground">
													ID {patient.id} · Etiologie {patient.etiology}
												</p>
											</div>
										</div>
										<div className="text-right">
											<Badge variant="secondary">{patient.status}</Badge>
											<p className="text-xs text-muted-foreground">
												Transplant {patient.date}
											</p>
										</div>
									</div>
								))}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Checklist initiala</CardTitle>
								<CardDescription>
									Asigura-te ca toate variabilele sunt completate.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3 text-sm">
								<div className="flex items-center justify-between">
									<span>Profil pacient (ID, varsta, sex)</span>
									<Badge variant="outline">Obligatoriu</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span>Transplant hepatic + donator</span>
									<Badge variant="outline">Critic</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span>Schema terapeutica</span>
									<Badge variant="outline">Recomandat</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span>Profilaxie antivirala + HBIg</span>
									<Badge variant="outline">Recomandat</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span>Alte medicamente importante</span>
									<Badge variant="outline">Optional</Badge>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</Main>
		</>
	);
}
