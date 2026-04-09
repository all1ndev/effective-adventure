import { useEffect, useMemo, useState } from "react";
import {
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { useTableUrlState } from "@/hooks/use-table-url-state";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { DataTablePagination, DataTableToolbar } from "@/components/data-table";
import { type AuditLogRow, getAuditLogColumns } from "./audit-log-columns";

type Props = {
	data: AuditLogRow[];
};

const actionFilterOptions = [
	{ label: "Creare", value: "create" },
	{ label: "Modificare", value: "update" },
	{ label: "Ștergere", value: "delete" },
];

const entityFilterOptions = [
	{ label: "Pacient", value: "patient" },
	{ label: "Medic", value: "doctor" },
	{ label: "Medicație", value: "medication" },
	{ label: "Jurnal medicație", value: "medication_log" },
	{ label: "Semne vitale", value: "vital_sign" },
	{ label: "Raport simptome", value: "symptom_report" },
	{ label: "Rezultat laborator", value: "lab_result" },
	{ label: "Notă clinică", value: "clinical_note" },
	{ label: "Alertă", value: "alert" },
	{ label: "Notificare", value: "notification" },
	{ label: "Mesaj", value: "message" },
	{ label: "Jurnal", value: "journal_entry" },
];

export function AuditLogTable({ data }: Props) {
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "createdAt", desc: true },
	]);

	const columns = useMemo(() => getAuditLogColumns(), []);

	const {
		columnFilters,
		onColumnFiltersChange,
		pagination,
		onPaginationChange,
		ensurePageInRange,
	} = useTableUrlState({
		pagination: { defaultPage: 1, defaultPageSize: 20 },
		globalFilter: { enabled: false },
		columnFilters: [
			{ columnId: "userName", searchKey: "user", type: "string" },
			{ columnId: "action", searchKey: "action", type: "array" },
			{ columnId: "entity", searchKey: "entity", type: "array" },
		],
	});

	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			pagination,
			columnFilters,
			columnVisibility,
		},
		onPaginationChange,
		onColumnFiltersChange,
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		getPaginationRowModel: getPaginationRowModel(),
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	useEffect(() => {
		ensurePageInRange(table.getPageCount());
	}, [table, ensurePageInRange]);

	return (
		<div className="flex flex-1 flex-col gap-4">
			<DataTableToolbar
				table={table}
				searchPlaceholder="Caută după utilizator..."
				searchKey="userName"
				filters={[
					{
						columnId: "action",
						title: "Acțiune",
						options: actionFilterOptions,
					},
					{
						columnId: "entity",
						title: "Entitate",
						options: entityFilterOptions,
					},
				]}
			/>
			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="group/row">
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										colSpan={header.colSpan}
										className={cn(
											"bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
											header.column.columnDef.meta?.className,
											header.column.columnDef.meta?.thClassName,
										)}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} className="group/row">
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className={cn(
												"bg-background group-hover/row:bg-muted",
												cell.column.columnDef.meta?.className,
												cell.column.columnDef.meta?.tdClassName,
											)}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={table.getVisibleLeafColumns().length}
									className="h-24 text-center"
								>
									Nu s-au găsit înregistrări.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<DataTablePagination table={table} className="mt-auto" />
		</div>
	);
}
