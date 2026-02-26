import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table";
import { LongText } from "@/components/long-text";
import { callTypes } from "../data/data";
import { type Patient } from "../data/schema";

export const patientsColumns: ColumnDef<Patient>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
				className="translate-y-[2px]"
			/>
		),
		meta: {
			className: cn("max-md:sticky start-0 z-10 rounded-tl-[inherit]"),
		},
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
				className="translate-y-[2px]"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "lastName",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Nume" />
		),
		cell: ({ row }) => (
			<LongText className="max-w-36 ps-3">{row.getValue("lastName")}</LongText>
		),
		meta: {
			className: cn(
				"drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]",
				"ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none",
			),
		},
		enableHiding: false,
	},
	{
		accessorKey: "firstName",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Prenume" />
		),
		cell: ({ row }) => (
			<LongText className="max-w-36">{row.getValue("firstName")}</LongText>
		),
		meta: { className: "w-36" },
	},
	{
		accessorKey: "patientPhone",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Nr de telefon" />
		),
		cell: ({ row }) => <div>{row.getValue("patientPhone") ?? "—"}</div>,
		enableSorting: false,
	},
	{
		accessorKey: "status",
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
		enableHiding: false,
		enableSorting: false,
	},
	{
		accessorKey: "etiology",
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
		enableHiding: false,
		enableSorting: false,
	},
	{
		id: "alteDate",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Alte date importante" />
		),
		cell: ({ row }) => {
			const { status, sex, age, etiology, transplantDate } = row.original;
			const badgeColor = callTypes.get(status);
			return (
				<div className="flex flex-wrap items-center gap-1.5">
					<Badge variant="outline" className={cn("capitalize", badgeColor)}>
						{status}
					</Badge>
					<Badge variant="outline" className="capitalize">
						{sex}
					</Badge>
					{age !== undefined && (
						<span className="text-sm text-muted-foreground">{age} ani</span>
					)}
					{etiology && <Badge variant="outline">{etiology}</Badge>}
					{transplantDate && (
						<span className="text-sm text-muted-foreground text-nowrap">
							Tx: {transplantDate}
						</span>
					)}
				</div>
			);
		},
		enableSorting: false,
	},
];
