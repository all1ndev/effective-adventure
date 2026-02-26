export interface PatientSummary {
	id: string;
	name: string;
	age?: number;
	transplantDate?: string;
	status: "activ" | "inactiv";
	healthStatus: "bun" | "atentie" | "critic";
	lastVisit: string;
	activeAlerts: number;
	complianceRate: number;
	lastLabDate: string;
}

export const patientSummaries: PatientSummary[] = [
	{
		id: "1",
		name: "Alexandru Ionescu",
		age: 54,
		transplantDate: "2021-03-15",
		status: "activ",
		healthStatus: "atentie",
		lastVisit: "2026-02-15",
		activeAlerts: 2,
		complianceRate: 87,
		lastLabDate: "2026-02-01",
	},
	{
		id: "2",
		name: "Maria Popescu",
		age: 47,
		transplantDate: "2022-07-20",
		status: "activ",
		healthStatus: "critic",
		lastVisit: "2026-02-10",
		activeAlerts: 3,
		complianceRate: 72,
		lastLabDate: "2026-02-10",
	},
	{
		id: "3",
		name: "Gheorghe Dumitrescu",
		age: 61,
		transplantDate: "2019-11-05",
		status: "inactiv",
		healthStatus: "bun",
		lastVisit: "2026-01-20",
		activeAlerts: 0,
		complianceRate: 95,
		lastLabDate: "2026-01-20",
	},
	{
		id: "4",
		name: "Elena Constantin",
		transplantDate: "2023-01-10",
		status: "activ",
		healthStatus: "bun",
		lastVisit: "2026-02-20",
		activeAlerts: 0,
		complianceRate: 98,
		lastLabDate: "2026-02-05",
	},
	{
		id: "5",
		name: "Ion Popa",
		age: 38,
		status: "activ",
		healthStatus: "bun",
		lastVisit: "2026-02-18",
		activeAlerts: 0,
		complianceRate: 91,
		lastLabDate: "2026-02-10",
	},
];
