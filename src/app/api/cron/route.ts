import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const authHeader = request.headers.get("authorization");
	const cronSecret = process.env.CRON_SECRET;

	if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
	}

	const baseUrl =
		process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
			? `https://${process.env.VERCEL_URL}`
			: "http://localhost:3000";

	const headers = {
		Authorization: `Bearer ${cronSecret}`,
	};

	const jobs = [
		{ name: "send-reminders", path: "/api/send-reminders" },
		{ name: "medication-reminders", path: "/api/cron/medication-reminders" },
		{ name: "missed-medications", path: "/api/cron/missed-medications" },
	];

	const results: Record<string, unknown> = {};

	for (const job of jobs) {
		try {
			const res = await fetch(`${baseUrl}${job.path}`, { headers });
			results[job.name] = await res.json();
		} catch (err) {
			results[job.name] = {
				error: err instanceof Error ? err.message : "Unknown error",
			};
		}
	}

	return NextResponse.json({ ok: true, results });
}
