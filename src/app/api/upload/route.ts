import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session || session.user.role !== "admin") {
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
	const uploadDir = path.join(process.cwd(), "uploads", "lab-results");
	await mkdir(uploadDir, { recursive: true });

	const buffer = Buffer.from(await file.arrayBuffer());
	await writeFile(path.join(uploadDir, fileName), buffer);

	return NextResponse.json({ fileName });
}
