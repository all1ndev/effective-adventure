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
import { etiologies } from "../data/data";
import { type Patient } from "../data/schema";
import { DataTableBulkActions } from "./data-table-bulk-actions";
import { EditPatientSheet } from "./edit-patient-sheet";
import { getPatientsColumns } from "./patients-columns";

type DataTableProps = {
	data: Patient[];
};

export function PatientsTable({ data }: DataTableProps) {
	const [rowSelection, setRowSelection] = useState({});
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
		status: false,
		etiology: false,
	});
	const [sorting, setSorting] = useState<SortingState>([]);
	const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
	const [editSheetOpen, setEditSheetOpen] = useState(false);

	function handleEdit(patient: Patient) {
		setEditingPatient(patient);
		setEditSheetOpen(true);
	}

	const columns = useMemo(() => getPatientsColumns(handleEdit), []);

	const {
		columnFilters,
		onColumnFiltersChange,
		pagination,
		onPaginationChange,
		ensurePageInRange,
	} = useTableUrlState({
		pagination: { defaultPage: 1, defaultPageSize: 10 },
		globalFilter: { enabled: false },
		columnFilters: [
			{ columnId: "lastName", searchKey: "lastName", type: "string" },
			{ columnId: "status", searchKey: "status", type: "array" },
			{ columnId: "etiology", searchKey: "etiology", type: "array" },
		],
	});

	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			pagination,
			rowSelection,
			columnFilters,
			columnVisibility,
		},
		enableRowSelection: true,
		onPaginationChange,
		onColumnFiltersChange,
		onRowSelectionChange: setRowSelection,
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
		<div
			className={cn(
				'max-sm:has-[div[role="toolbar"]]:mb-16',
				"flex flex-1 flex-col gap-4",
			)}
		>
			<DataTableToolbar
				table={table}
				searchPlaceholder="Cauta dupa nume..."
				searchKey="lastName"
				filters={[
					{
						columnId: "status",
						title: "Status",
						options: [
							{ label: "Activ", value: "activ" },
							{ label: "Inactiv", value: "inactiv" },
						],
					},
					{
						columnId: "etiology",
						title: "Etiologie",
						options: etiologies.map((e) => ({ ...e })),
					},
				]}
			/>
			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="group/row">
								{headerGroup.headers.map((header) => {
									return (
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
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className="group/row"
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className={cn(
												"bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
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
									Nu s-au gasit rezultate.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<DataTablePagination table={table} className="mt-auto" />
			<DataTableBulkActions table={table} />

			<EditPatientSheet
				patient={editingPatient}
				open={editSheetOpen}
				onOpenChange={setEditSheetOpen}
			/>
		</div>
	);
}
