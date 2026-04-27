import { eq } from "drizzle-orm";
import { db } from "@/db";
import { alert } from "@/db/alert-schema";
import { patient } from "@/db/patient-schema";
import { sendPushToUser } from "@/lib/push";

type PatientInfo = { name: string; doctorId: string | null };

async function getPatientInfo(patientId: string): Promise<PatientInfo> {
	const rows = await db
		.select({
			firstName: patient.firstName,
			lastName: patient.lastName,
			doctorId: patient.doctorId,
		})
		.from(patient)
		.where(eq(patient.userId, patientId))
		.limit(1);
	if (rows.length === 0) return { name: "Pacient necunoscut", doctorId: null };
	return {
		name: `${rows[0].firstName} ${rows[0].lastName}`,
		doctorId: rows[0].doctorId,
	};
}

const severityLabels: Record<string, string> = {
	critical: "CRITIC",
	warning: "Atenție",
	info: "Info",
};

async function insertAlert(
	patientId: string,
	patientName: string,
	doctorId: string | null,
	type: "vital" | "simptom" | "laborator" | "medicatie",
	severity: "critical" | "warning" | "info",
	message: string,
	notify: boolean = severity === "critical" || severity === "warning",
) {
	await db.insert(alert).values({
		id: crypto.randomUUID(),
		patientId,
		patientName,
		type,
		severity,
		message,
	});

	if (notify && doctorId) {
		await sendPushToUser(doctorId, {
			title: `[${severityLabels[severity]}] ${patientName}`,
			body: message,
		});
	}
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
	if (data.systolic < 80) return "critical";
	if (data.systolic >= 140 || data.diastolic >= 90) status = "warning";
	if (data.systolic < 90 || data.diastolic < 60) status = "warning";

	// Temperature
	if (data.temperature >= 38) return "critical";
	if (data.temperature < 34) return "critical";
	if (data.temperature >= 37.5 || data.temperature < 35) status = "warning";

	// Pulse
	if (data.pulse > 120) return "critical";
	if (data.pulse < 40) return "critical";
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
	} else if (data.systolic < 80) {
		messages.push(
			`Hipotensiune severă: ${data.systolic}/${data.diastolic} mmHg`,
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

	if (data.temperature >= 38) {
		messages.push(
			`Febră: ${data.temperature}°C — risc de infecție post-transplant`,
		);
	} else if (data.temperature >= 37.5) {
		messages.push(`Temperatură subfebrilă: ${data.temperature}°C`);
	} else if (data.temperature < 34) {
		messages.push(`Hipotermie severă: ${data.temperature}°C`);
	} else if (data.temperature < 35) {
		messages.push(`Hipotermie: ${data.temperature}°C`);
	}

	if (data.pulse > 120) {
		messages.push(`Tahicardie severă: ${data.pulse} bpm`);
	} else if (data.pulse > 100) {
		messages.push(`Tahicardie: ${data.pulse} bpm`);
	} else if (data.pulse < 40) {
		messages.push(`Bradicardie severă: ${data.pulse} bpm`);
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

	const { name, doctorId } = await getPatientInfo(patientId);
	const messages = buildVitalAlertMessages(data);

	await Promise.all(
		messages.map((msg) =>
			insertAlert(patientId, name, doctorId, "vital", status, msg),
		),
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
	const { name, doctorId } = await getPatientInfo(patientId);
	const symptomsLower = data.symptoms.map((s) => s.toLowerCase());

	const hasCriticalSymptom = symptomsLower.some((s) =>
		CRITICAL_SYMPTOMS.includes(s),
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
		doctorId,
		"simptom",
		alertSeverity,
		`Simptome ${severityLabel} raportate: ${data.symptoms.join(", ")}`,
		alertSeverity === "critical",
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

	const { name, doctorId } = await getPatientInfo(patientId);

	if (data.status === "omis") {
		await insertAlert(
			patientId,
			name,
			doctorId,
			"medicatie",
			"warning",
			`Doză omisă: ${data.medicationName}`,
			false,
		);
	} else if (data.status === "intarziat") {
		await insertAlert(
			patientId,
			name,
			doctorId,
			"medicatie",
			"info",
			`Doză întârziată: ${data.medicationName}`,
		);
	}
}
