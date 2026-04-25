import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { db } from "@/db";
import { labResult } from "@/db/lab-result-schema";
import { patient } from "@/db/patient-schema";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
	}

	const segments = (await params).path;
	// Only allow access to lab-results subdirectory
	if (segments[0] !== "lab-results" || segments.length !== 2) {
		return NextResponse.json({ error: "Nepermis" }, { status: 403 });
	}

	const fileName = segments[1];
	// Prevent path traversal
	if (fileName.includes("..") || fileName.includes("/")) {
		return NextResponse.json({ error: "Nepermis" }, { status: 403 });
	}

	// Verify user has access to this file
	const result = await db
		.select({ patientId: labResult.patientId })
		.from(labResult)
		.where(eq(labResult.pdfFileName, fileName))
		.limit(1);

	if (!result[0]) {
		return NextResponse.json(
			{ error: "Fișierul nu a fost găsit." },
			{ status: 404 },
		);
	}

	const fileOwnerId = result[0].patientId;

	if (session.user.role === "user") {
		// Patient can only access their own lab results
		if (fileOwnerId !== session.user.id) {
			return NextResponse.json({ error: "Nepermis" }, { status: 403 });
		}
	} else if (session.user.role === "doctor") {
		// Doctor can only access their own patients' lab results
		const patientRecord = await db
			.select({ doctorId: patient.doctorId })
			.from(patient)
			.where(eq(patient.userId, fileOwnerId))
			.limit(1);
		if (patientRecord[0]?.doctorId !== session.user.id) {
			return NextResponse.json({ error: "Nepermis" }, { status: 403 });
		}
	}
	// admin can access all files

	const { data, error } = await supabaseAdmin.storage
		.from("lab-results")
		.download(fileName);

	if (error || !data) {
		return NextResponse.json(
			{ error: "Fișierul nu a fost găsit." },
			{ status: 404 },
		);
	}

	const buffer = Buffer.from(await data.arrayBuffer());
	return new NextResponse(buffer, {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `inline; filename="${fileName}"`,
			"Cache-Control": "private, max-age=3600",
		},
	});
}
