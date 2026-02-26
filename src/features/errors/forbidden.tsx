import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ForbiddenError() {
	const router = useRouter();
	return (
		<div className="h-svh">
			<div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
				<h1 className="text-[7rem] leading-tight font-bold">403</h1>
				<span className="font-medium">Acces interzis</span>
				<p className="text-center text-muted-foreground">
					Nu ai permisiunea necesară <br />
					pentru a accesa această resursă.
				</p>
				<div className="mt-6 flex gap-4">
					<Button variant="outline" onClick={() => router.back()}>
						Înapoi
					</Button>
					<Button onClick={() => router.push("/")}>Acasă</Button>
				</div>
			</div>
		</div>
	);
}
