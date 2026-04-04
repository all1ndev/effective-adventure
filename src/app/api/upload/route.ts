import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isMedicRole } from "@/lib/roles";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session || !isMedicRole(session.user.role)) {
		return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
	}

	const formData = await request.formData();
	const file = formData.get("file") as File | null;

	if (!file) {
		return NextResponse.json({ error: "Fișierul lipsește." }, { status: 400 });
	}

	if (file.type !== "application/pdf") {
		return NextResponse.json(
			{ error: "Doar fișiere PDF sunt acceptate." },
			{ status: 400 },
		);
	}

	if (file.size > 10 * 1024 * 1024) {
		return NextResponse.json(
			{ error: "Fișierul nu poate depăși 10 MB." },
			{ status: 400 },
		);
	}

	const fileName = `${crypto.randomUUID()}.pdf`;
	const buffer = Buffer.from(await file.arrayBuffer());

	const { error } = await supabaseAdmin.storage
		.from("lab-results")
		.upload(fileName, buffer, {
			contentType: "application/pdf",
			upsert: false,
		});

	if (error) {
		return NextResponse.json(
			{ error: "Eroare la încărcarea fișierului." },
			{ status: 500 },
		);
	}

	return NextResponse.json({ fileName });
}
