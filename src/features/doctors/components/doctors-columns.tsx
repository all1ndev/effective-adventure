import { type ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table";
import { LongText } from "@/components/long-text";
import { doctorStatusStyles } from "../data/data";
import { type Doctor } from "../data/schema";

export function getDoctorsColumns(
	onEdit: (doctor: Doctor) => void,
): ColumnDef<Doctor>[] {
	return [
		{
			accessorKey: "lastName",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Nume" />
			),
			cell: ({ row }) => (
				<LongText className="max-w-36">{row.getValue("lastName")}</LongText>
			),
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
		},
		{
			accessorKey: "email",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Email" />
			),
			cell: ({ row }) => <div>{row.getValue("email") ?? "—"}</div>,
		},
		{
			accessorKey: "specialization",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Specializare" />
			),
			cell: ({ row }) => <div>{row.getValue("specialization") ?? "—"}</div>,
		},
		{
			accessorKey: "phone",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Telefon" />
			),
			cell: ({ row }) => <div>{row.getValue("phone") ?? "—"}</div>,
			enableSorting: false,
		},
		{
			accessorKey: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => {
				const status = row.getValue("status") as string;
				const badgeColor = doctorStatusStyles.get(
					status as "activ" | "inactiv",
				);
				return (
					<Badge variant="outline" className={cn("capitalize", badgeColor)}>
						{status}
					</Badge>
				);
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={() => onEdit(row.original)}
				>
					<Pencil className="h-4 w-4" />
					<span className="sr-only">Editează medic</span>
				</Button>
			),
			enableSorting: false,
			enableHiding: false,
		},
	];
}
