import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UnauthorisedError() {
	const router = useRouter();
	return (
		<div className="h-svh">
			<div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
				<h1 className="text-[7rem] leading-tight font-bold">401</h1>
				<span className="font-medium">Acces neautorizat</span>
				<p className="text-center text-muted-foreground">
					Te rugăm să te conectezi cu credențialele corespunzătoare <br /> to
					access this resource.
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
