import Link from "next/link";
import { Stethoscope, HeartPulse } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AuthLayout } from "../auth-layout";

export function RoleSelection() {
	return (
		<AuthLayout>
			<div className="space-y-2 text-center">
				<h2 className="text-lg font-semibold tracking-tight">
					Autentifică-te mai întâi
				</h2>
				<p className="text-sm text-muted-foreground">
					Selectează rolul pentru a continua
				</p>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<Link href="/sign-in?role=doctor">
					<Card className="cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground">
						<CardContent className="flex flex-col items-center gap-3 py-8">
							<Stethoscope className="h-10 w-10" />
							<span className="font-medium">Doctor</span>
						</CardContent>
					</Card>
				</Link>
				<Link href="/sign-in?role=patient">
					<Card className="cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground">
						<CardContent className="flex flex-col items-center gap-3 py-8">
							<HeartPulse className="h-10 w-10" />
							<span className="font-medium">Pacient</span>
						</CardContent>
					</Card>
				</Link>
			</div>
		</AuthLayout>
	);
}
