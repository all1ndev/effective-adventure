import { type SymptomReport } from "./schema";

export const symptomReports: SymptomReport[] = [
	{
		id: "1",
		patientId: "1",
		date: "2026-02-20",
		symptoms: ["Oboseala", "Lipsa poftei de mancare"],
		severity: "usoara",
		notes: "Ma simt obosit dupa activitati usoare.",
	},
	{
		id: "2",
		patientId: "1",
		date: "2026-02-22",
		symptoms: ["Febra", "Durere abdominala", "Greata"],
		severity: "moderata",
		notes: "Febra a aparut noaptea, temperatura 37.8°C.",
	},
	{
		id: "3",
		patientId: "1",
		date: "2026-02-24",
		symptoms: ["Icter (ingalbenirea pielii)", "Urina inchisa la culoare"],
		severity: "severa",
		notes: "Observ ingalbenire usoara a sclerelor.",
	},
	{
		id: "4",
		patientId: "2",
		date: "2026-02-21",
		symptoms: ["Durere de cap", "Oboseala"],
		severity: "usoara",
	},
	{
		id: "5",
		patientId: "2",
		date: "2026-02-25",
		symptoms: ["Edeme (umflaturi)", "Dificultati de respiratie"],
		severity: "moderata",
		notes: "Edeme la nivelul gleznelor.",
	},
];
