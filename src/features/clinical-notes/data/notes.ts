import { type ClinicalNote } from "./schema";

export const clinicalNotes: ClinicalNote[] = [
	{
		id: "1",
		patientId: "1",
		visitDate: "2026-02-15",
		content:
			"Pacient in stare generala buna. Analize in limite normale. Tensiunea arteriala 128/82 mmHg. Greutate stabila. Se mentine schema de imunosupresie. Urmatorul control in 4 saptamani.",
		author: "Dr. Andrei Marin",
	},
	{
		id: "2",
		patientId: "1",
		visitDate: "2026-01-18",
		content:
			"Control lunar de rutina. Niveluri Tacrolimus: 8.5 ng/mL (in tinta terapeutica). Functia hepatica normala. Pacientul raporteaza oboseala usoara — posibil efectul secundar al medicatiei. Se continua schema curenta. Se recomanda activitate fizica moderata.",
		author: "Dr. Andrei Marin",
	},
	{
		id: "3",
		patientId: "1",
		visitDate: "2025-12-20",
		content:
			"Control trimestrial. Stare generala buna. ALT, AST in limite normale. Creatinina stabila. Pacientul a respectat bine schema de medicatie. Se reduce usor doza de Prednison de la 7.5 mg la 5 mg/zi. Ecografie abdominala normala.",
		author: "Dr. Andrei Marin",
	},
	{
		id: "4",
		patientId: "2",
		visitDate: "2026-02-10",
		content:
			"ATENTIE: Enzime hepatice crescute — ALT 65 U/L, bilirubina 2.1 mg/dL. Suspiciune rejet acut. Se programeaza biopsie hepatica de urgenta. Se creste doza de imunosupresie conform protocol. Pacientul internat pentru monitorizare.",
		author: "Dr. Andrei Marin",
	},
	{
		id: "5",
		patientId: "2",
		visitDate: "2026-01-20",
		content:
			"Control lunar. Rezultate laborator in limite normale. Pacientul raporteaza edeme usoare la glezne — posibil effect al ciclosporinei. Se recomanda dieta hiposodata si exercitii pentru extremitati. Urmatorul control in 3 saptamani.",
		author: "Dr. Andrei Marin",
	},
];
