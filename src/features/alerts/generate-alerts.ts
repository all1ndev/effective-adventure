import { eq } from "drizzle-orm";
import { db } from "@/db";
import { alert } from "@/db/alert-schema";
import { patient } from "@/db/patient-schema";
import type { TestValue } from "@/db/lab-result-schema";

async function getPatientName(patientId: string): Promise<string> {
	const rows = await db
		.select({ firstName: patient.firstName, lastName: patient.lastName })
		.from(patient)
		.where(eq(patient.userId, patientId))
		.limit(1);
	if (rows.length === 0) return "Pacient necunoscut";
	return `${rows[0].firstName} ${rows[0].lastName}`;
}

async function insertAlert(
	patientId: string,
	patientName: string,
	type: "vital" | "simptom" | "laborator" | "medicatie",
	severity: "critical" | "warning" | "info",
	message: string,
) {
	await db.insert(alert).values({
		id: crypto.randomUUID(),
		patientId,
		patientName,
		type,
		severity,
		message,
	});
}

// --- Vital signs thresholds (post-transplant hepatic) ---

type VitalData = {
	systolic: number;
	diastolic: number;
	temperature: number;
	pulse: number;
	weight: number;
};

type VitalStatus = "normal" | "warning" | "critical";

/** Compute the overall status for a vital sign entry. */
export function computeVitalStatus(data: VitalData): VitalStatus {
	let status: VitalStatus = "normal";

	// Blood pressure
	if (data.systolic >= 180 || data.diastolic >= 120) return "critical";
	if (data.systolic >= 140 || data.diastolic >= 90) status = "warning";
	if (data.systolic < 90 || data.diastolic < 60) status = "warning";

	// Temperature
	if (data.temperature >= 39) return "critical";
	if (data.temperature >= 37.5 || data.temperature < 35) status = "warning";

	// Pulse
	if (data.pulse > 120) return "critical";
	if (data.pulse > 100 || data.pulse < 50) status = "warning";

	return status;
}

/** Build a human-readable summary of what's abnormal. */
function buildVitalAlertMessages(data: VitalData): string[] {
	const messages: string[] = [];

	if (data.systolic >= 180 || data.diastolic >= 120) {
		messages.push(
			`Tensiune arterială critic ridicată: ${data.systolic}/${data.diastolic} mmHg`,
		);
	} else if (data.systolic >= 140 || data.diastolic >= 90) {
		messages.push(
			`Tensiune arterială ridicată: ${data.systolic}/${data.diastolic} mmHg`,
		);
	} else if (data.systolic < 90 || data.diastolic < 60) {
		messages.push(
			`Tensiune arterială scăzută: ${data.systolic}/${data.diastolic} mmHg`,
		);
	}

	if (data.temperature >= 39) {
		messages.push(
			`Febră ridicată: ${data.temperature}°C — risc de infecție post-transplant`,
		);
	} else if (data.temperature >= 37.5) {
		messages.push(`Temperatură subfebrilă: ${data.temperature}°C`);
	} else if (data.temperature < 35) {
		messages.push(`Hipotermie: ${data.temperature}°C`);
	}

	if (data.pulse > 120) {
		messages.push(`Tahicardie severă: ${data.pulse} bpm`);
	} else if (data.pulse > 100) {
		messages.push(`Tahicardie: ${data.pulse} bpm`);
	} else if (data.pulse < 50) {
		messages.push(`Bradicardie: ${data.pulse} bpm`);
	}

	return messages;
}

export async function generateVitalSignAlerts(
	patientId: string,
	data: VitalData,
) {
	const status = computeVitalStatus(data);
	if (status === "normal") return;

	const name = await getPatientName(patientId);
	const messages = buildVitalAlertMessages(data);

	await Promise.all(
		messages.map((msg) => insertAlert(patientId, name, "vital", status, msg)),
	);
}

// --- Symptom report alerts ---

const CRITICAL_SYMPTOMS = [
	"febră",
	"icter",
	"sângerare",
	"durere abdominală severă",
	"confuzie",
	"dispnee",
	"vărsături cu sânge",
	"scaun negru",
];

const WARNING_SYMPTOMS = [
	"greață",
	"vărsături",
	"oboseală",
	"durere abdominală",
	"prurit",
	"edem",
	"scădere în greutate",
	"lipsa poftei de mâncare",
	"diaree",
];

export async function generateSymptomAlerts(
	patientId: string,
	data: {
		symptoms: string[];
		severity: "usoara" | "moderata" | "severa";
		notes?: string | null;
	},
) {
	const name = await getPatientName(patientId);
	const symptomsLower = data.symptoms.map((s) => s.toLowerCase());

	const hasCriticalSymptom = symptomsLower.some((s) =>
		CRITICAL_SYMPTOMS.some((cs) => s.includes(cs)),
	);

	// Determine alert severity
	let alertSeverity: "critical" | "warning" | "info";
	if (data.severity === "severa" || hasCriticalSymptom) {
		alertSeverity = "critical";
	} else if (data.severity === "moderata") {
		alertSeverity = "warning";
	} else {
		alertSeverity = "info";
	}

	const severityLabel =
		data.severity === "severa"
			? "severe"
			: data.severity === "moderata"
				? "moderate"
				: "ușoare";

	await insertAlert(
		patientId,
		name,
		"simptom",
		alertSeverity,
		`Simptome ${severityLabel} raportate: ${data.symptoms.join(", ")}`,
	);
}

// --- Medication compliance alerts ---

export async function generateMedicationAlerts(
	patientId: string,
	data: {
		medicationName: string;
		status: "luat" | "omis" | "intarziat";
	},
) {
	if (data.status === "luat") return;

	const name = await getPatientName(patientId);

	if (data.status === "omis") {
		await insertAlert(
			patientId,
			name,
			"medicatie",
			"warning",
			`Doză omisă: ${data.medicationName}`,
		);
	} else if (data.status === "intarziat") {
		await insertAlert(
			patientId,
			name,
			"medicatie",
			"info",
			`Doză întârziată: ${data.medicationName}`,
		);
	}
}

// --- Lab result alerts ---

export async function generateLabResultAlerts(
	patientId: string,
	tests: TestValue[],
) {
	const name = await getPatientName(patientId);
	const alerts: Promise<void>[] = [];

	for (const test of tests) {
		const deviation =
			test.value < test.refMin
				? ((test.refMin - test.value) / test.refMin) * 100
				: test.value > test.refMax
					? ((test.value - test.refMax) / test.refMax) * 100
					: 0;

		if (deviation === 0) continue;

		const direction = test.value < test.refMin ? "sub" : "peste";
		const refRange = `${test.refMin}–${test.refMax} ${test.unit}`;

		if (deviation > 50) {
			alerts.push(
				insertAlert(
					patientId,
					name,
					"laborator",
					"critical",
					`${test.name}: ${test.value} ${test.unit} — mult ${direction} intervalul de referință (${refRange})`,
				),
			);
		} else if (deviation > 20) {
			alerts.push(
				insertAlert(
					patientId,
					name,
					"laborator",
					"warning",
					`${test.name}: ${test.value} ${test.unit} — ${direction} intervalul de referință (${refRange})`,
				),
			);
		} else {
			alerts.push(
				insertAlert(
					patientId,
					name,
					"laborator",
					"info",
					`${test.name}: ${test.value} ${test.unit} — ușor ${direction} referință (${refRange})`,
				),
			);
		}
	}

	await Promise.all(alerts);
}
