"use client";

import { useTransition } from "react";
import { type Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DataTableBulkActions as BulkActionsToolbar } from "@/components/data-table";
import { deletePatients } from "../actions";

type DataTableBulkActionsProps<TData extends { id: string }> = {
	table: Table<TData>;
};

export function DataTableBulkActions<TData extends { id: string }>({
	table,
}: DataTableBulkActionsProps<TData>) {
	const [isDeleting, startTransition] = useTransition();
	const selectedRows = table.getFilteredSelectedRowModel().rows;

	const handleBulkDelete = () => {
		const ids = selectedRows.map((row) => row.original.id);
		startTransition(async () => {
			const result = await deletePatients(ids);
			if (!result.success) {
				toast.error(result.error ?? "Eroare la ștergerea pacienților");
				return;
			}
			toast.success(`${ids.length} pacienți au fost șterși cu succes!`);
			table.resetRowSelection();
		});
	};

	return (
		<BulkActionsToolbar table={table} entityName="patient">
			<AlertDialog>
				<Tooltip>
					<TooltipTrigger asChild>
						<AlertDialogTrigger asChild>
							<Button
								variant="destructive"
								size="icon"
								className="size-8"
								disabled={isDeleting}
								aria-label="Șterge pacienții selectați"
							>
								<Trash2 />
								<span className="sr-only">Șterge pacienții selectați</span>
							</Button>
						</AlertDialogTrigger>
					</TooltipTrigger>
					<TooltipContent>
						<p>Șterge pacienții selectați</p>
					</TooltipContent>
				</Tooltip>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirmați ștergerea</AlertDialogTitle>
						<AlertDialogDescription>
							Această acțiune este ireversibilă. {selectedRows.length}{" "}
							{selectedRows.length === 1
								? "pacient va fi șters"
								: "pacienți vor fi șterși"}{" "}
							definitiv, împreună cu toate datele medicale asociate.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Anulează</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleBulkDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Șterge definitiv
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</BulkActionsToolbar>
	);
}
