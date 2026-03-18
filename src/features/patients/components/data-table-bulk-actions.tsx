import { type Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTableBulkActions as BulkActionsToolbar } from "@/components/data-table";

type DataTableBulkActionsProps<TData> = {
	table: Table<TData>;
};

export function DataTableBulkActions<TData>({
	table,
}: DataTableBulkActionsProps<TData>) {
	const handleBulkDelete = () => {
		toast.error("Functionalitate de stergere nu este inca implementata.");
		table.resetRowSelection();
	};

	return (
		<BulkActionsToolbar table={table} entityName="patient">
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="destructive"
						size="icon"
						onClick={handleBulkDelete}
						className="size-8"
						aria-label="Sterge pacientii selectati"
					>
						<Trash2 />
						<span className="sr-only">Sterge pacientii selectati</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Sterge pacientii selectati</p>
				</TooltipContent>
			</Tooltip>
		</BulkActionsToolbar>
	);
}
