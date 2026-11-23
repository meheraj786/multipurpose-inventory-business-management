"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Trash2, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PreparedProduct } from "@/hooks/usePreparedProducts";

type ColumnMeta = {
	onEdit: (pp: PreparedProduct) => void;
	onDelete: (id: string) => void;
	onProduce: (pp: PreparedProduct) => void;
};

export const getPreparedProductColumns = (
	meta: ColumnMeta,
): ColumnDef<PreparedProduct>[] => [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => (
			<Link
				href={`/dashboard/prepared-products/${row.original.id}`}
				className="font-medium hover:underline cursor-pointer"
			>
				<p className="font-medium">{row.original.name}</p>
				{row.original.description && (
					<p className="text-xs text-muted-foreground truncate max-w-48">
						{row.original.description}
					</p>
				)}
			</Link>
		),
	},
	{
		accessorKey: "unit",
		header: "Unit",
		cell: ({ row }) => (
			<Badge variant="outline" className="font-mono text-xs">
				{row.original.unit?.symbol}
			</Badge>
		),
	},
	{
		accessorKey: "preparedProductItems",
		header: "Ingredients",
		cell: ({ row }) => {
			const count = row.original?.length ?? 0;
			return (
				<span className="text-sm text-muted-foreground">
					{count} ingredient{count !== 1 ? "s" : ""}
				</span>
			);
		},
	},
	{
		accessorKey: "defaultSalePrice",
		header: "Sale Price",
		cell: ({ row }) =>
			row.original.defaultSalePrice != null
				? `${Number(row.original.defaultSalePrice).toFixed(2)}`
				: "—",
	},
	{
		accessorKey: "rawMaterialCost",
		header: "Material Cost",
		cell: ({ row }) =>
			row.original.rawMaterialCost != null
				? `${Number(row.original.rawMaterialCost).toFixed(2)}`
				: "—",
	},
	{
		accessorKey: "totalStock",
		header: "Stock",
		cell: ({ row }) => {
			const stock = row.original.totalStock ?? 0;
			return (
				<Badge
					variant="outline"
					className={
						stock === 0
							? "border-destructive text-destructive"
							: "border-green-500 text-green-700"
					}
				>
					{stock} {row.original.unit?.symbol}
				</Badge>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
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
							onClick={() =>
								router.push(`/dashboard/prepared-products/${row.original.id}`)
							}
						>
							<Eye className="mr-2 h-4 w-4" />
							View Details
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => meta.onProduce(row.original)}>
							<Zap className="mr-2 h-4 w-4" />
							Produce Stock
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
		},
	},
];
