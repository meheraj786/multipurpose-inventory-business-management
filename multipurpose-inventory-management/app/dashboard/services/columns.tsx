"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { useCurrency } from "@/hooks/useCurrency";
import type { Service } from "@/lib/api/services/service.service";

type ColumnMeta = {
	onEdit: (service: Service) => void;
	onDelete: (id: string) => void;
};

const ActionsCell = ({
	row,
	meta,
}: {
	row: { original: Service };
	meta: ColumnMeta;
}) => {
	const router = useRouter();
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={() => router.push(`/dashboard/services/${row.original.id}`)}
				>
					<Eye className="mr-2 h-4 w-4" />
					View Details
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => meta.onEdit(row.original)}>
					<Pencil className="mr-2 h-4 w-4" />
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem
					className="text-destructive"
					onClick={() => meta.onDelete(row.original.id)}
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export const getServiceColumns = (
	meta: ColumnMeta,
	symbol: string,
): ColumnDef<Service>[] => [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => (
			<Link
				className="font-medium hover:underline cursor-pointer"
				href={`/dashboard/services/${row.original.id}`}
			>
				{row.original.name}
			</Link>
		),
	},
	{
		accessorKey: "category",
		header: "Category",
		cell: ({ row }) => row.original.category?.name ?? "—",
	},
	{
		accessorKey: "subCategory",
		header: "Subcategory",
		cell: ({ row }) => row.original.subCategory?.name ?? "—",
	},
	{
		accessorKey: "internalCost",
		header: "Internal Cost",
		cell: ({ row }) => {
			const val = row.original.internalCost;
			return val != null ? `${symbol}${Number(val).toFixed(2)}` : "—";
		},
	},
	{
		accessorKey: "salePrice",
		header: "Sale Price",
		cell: ({ row }) => `${symbol}${Number(row.original.salePrice).toFixed(2)}`,
	},
	{
		id: "actions",
		cell: ({ row }) => <ActionsCell row={row} meta={meta} />,
	},
];
