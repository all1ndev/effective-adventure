import { NextResponse } from "next/server";
import { GET as sendReminders } from "@/app/api/send-reminders/route";
import { GET as medicationReminders } from "@/app/api/cron/medication-reminders/route";
import { GET as missedMedications } from "@/app/api/cron/missed-medications/route";

export async function GET(request: Request) {
	const authHeader = request.headers.get("authorization");
	const cronSecret = process.env.CRON_SECRET;

	if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
	}

	const results: Record<string, unknown> = {};

	const jobs: { name: string; handler: (req: Request) => Promise<Response> }[] =
		[
			{ name: "send-reminders", handler: sendReminders },
			{ name: "medication-reminders", handler: medicationReminders },
			{ name: "missed-medications", handler: missedMedications },
		];

	for (const job of jobs) {
		try {
			const res = await job.handler(request);
			results[job.name] = await res.json();
		} catch (err) {
			results[job.name] = {
				error: err instanceof Error ? err.message : "Unknown error",
			};
		}
	}

	return NextResponse.json({ ok: true, results });
}
