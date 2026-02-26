import { type Medication, type MedicationLog } from "./schema";

export const medications: Medication[] = [
	{
		id: "1",
		patientId: "1",
		name: "Tacrolimus",
		dose: "2 mg",
		frequency: "De 2 ori pe zi",
		startDate: "2021-03-15",
	},
	{
		id: "2",
		patientId: "1",
		name: "Micofenolat mofetil",
		dose: "500 mg",
		frequency: "De 2 ori pe zi",
		startDate: "2021-03-15",
	},
	{
		id: "3",
		patientId: "1",
		name: "Prednison",
		dose: "5 mg",
		frequency: "O data pe zi (dimineata)",
		startDate: "2021-03-15",
		endDate: "2026-03-15",
	},
	{
		id: "4",
		patientId: "1",
		name: "Omeprazol",
		dose: "20 mg",
		frequency: "O data pe zi (pe stomacul gol)",
		startDate: "2021-03-15",
	},
	{
		id: "5",
		patientId: "2",
		name: "Ciclosporina",
		dose: "100 mg",
		frequency: "De 2 ori pe zi",
		startDate: "2022-07-20",
	},
	{
		id: "6",
		patientId: "2",
		name: "Azatioprina",
		dose: "50 mg",
		frequency: "O data pe zi",
		startDate: "2022-07-20",
		endDate: "2026-04-01",
	},
];

export const medicationLogs: MedicationLog[] = [
	{
		id: "1",
		medicationId: "1",
		takenAt: "2026-02-26T08:00:00",
		status: "luat",
	},
	{
		id: "2",
		medicationId: "1",
		takenAt: "2026-02-26T20:00:00",
		status: "luat",
	},
	{
		id: "3",
		medicationId: "2",
		takenAt: "2026-02-26T08:00:00",
		status: "luat",
	},
	{
		id: "4",
		medicationId: "2",
		takenAt: "2026-02-26T20:00:00",
		status: "omis",
	},
	{
		id: "5",
		medicationId: "3",
		takenAt: "2026-02-26T08:00:00",
		status: "luat",
	},
	{
		id: "6",
		medicationId: "4",
		takenAt: "2026-02-26T07:30:00",
		status: "luat",
	},
	{
		id: "7",
		medicationId: "1",
		takenAt: "2026-02-25T08:00:00",
		status: "luat",
	},
	{
		id: "8",
		medicationId: "1",
		takenAt: "2026-02-25T20:00:00",
		status: "intarziat",
	},
];
