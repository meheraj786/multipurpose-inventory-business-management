"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Product } from "@/hooks/useProducts";

type ColumnMeta = {
	onEdit: (product: Product) => void;
	onDelete: (id: string) => void;
};

export const getProductColumns = (
	meta: ColumnMeta,
	symbol: string,
): ColumnDef<Product>[] => [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => (
			<Link
				href={`/dashboard/products/${row.original.id}`}
				className="font-medium hover:underline cursor-pointer"
			>
				<p className="font-medium">{row.original.name}</p>
				{row.original.sku && (
					<p className="text-xs text-muted-foreground font-mono">
						{row.original.sku}
					</p>
				)}
			</Link>
		),
	},
	{
		accessorKey: "category",
		header: "Category",
		cell: ({ row }) => (
			<div>
				<p>{row.original.category?.name ?? "—"}</p>
				{row.original.subCategory && (
					<p className="text-xs text-muted-foreground">
						{row.original.subCategory.name}
					</p>
				)}
			</div>
		),
	},
	{
		accessorKey: "defaultSalePrice",
		header: "Sale Price",
		cell: ({ row }) =>
			row.original.defaultSalePrice != null
				? `${symbol}${Number(row.original.defaultSalePrice).toFixed(2)}`
				: "—",
	},
	{
		accessorKey: "defaultPurchasePrice",
		header: "Purchase Price",
		cell: ({ row }) =>
			row.original.defaultPurchasePrice != null
				? `${symbol}${Number(row.original.defaultPurchasePrice).toFixed(2)}`
				: "—",
	},
	{
		accessorKey: "totalStock",
		header: "Stock",
		cell: ({ row }) => {
			const stock = row.original.totalStock ?? 0;
			const alert = row.original.lowStockAlert
				? Number(row.original.lowStockAlert)
				: null;
			const isLow = alert !== null && stock <= alert;
			return (
				<Badge
					variant="outline"
					className={
						isLow
							? "border-destructive text-destructive"
							: stock === 0
								? "border-muted text-muted-foreground"
								: "border-green-500 text-green-700"
					}
				>
					{stock} units
				</Badge>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<Link href={`/dashboard/products/${row.original.id}`}>
							<DropdownMenuItem>
								<Eye className="mr-2 h-4 w-4" />
								View Details
							</DropdownMenuItem>
						</Link>
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
