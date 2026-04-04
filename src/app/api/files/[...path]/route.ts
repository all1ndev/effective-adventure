import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

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
