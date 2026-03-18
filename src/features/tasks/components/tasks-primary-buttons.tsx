import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSarcini } from "./tasks-provider";

export function SarciniPrimaryButtons() {
	const { setOpen } = useSarcini();
	return (
		<div className="flex gap-2">
			<Button
				variant="outline"
				className="space-x-1"
				onClick={() => setOpen("import")}
			>
				<span>Importă</span> <Download size={18} />
			</Button>
			<Button className="space-x-1" onClick={() => setOpen("create")}>
				<span>Creează</span> <Plus size={18} />
			</Button>
		</div>
	);
}
