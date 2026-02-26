import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function NotFoundError() {
	const router = useRouter();
	return (
		<div className="h-svh">
			<div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
				<h1 className="text-[7rem] leading-tight font-bold">404</h1>
				<span className="font-medium">Pagina nu a fost găsită!</span>
				<p className="text-center text-muted-foreground">
					Pagina pe care o cauți nu există <br />
					sau a fost eliminată.
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
