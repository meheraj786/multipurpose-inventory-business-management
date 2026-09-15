"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, PackagePlus, Pencil, Trash2 } from "lucide-react";
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
import type { RawProduct } from "@/hooks/useRawProducts";

type ColumnMeta = {
	onEdit: (rawProduct: RawProduct) => void;
	onDelete: (id: string) => void;
	onStockIn: (rawProduct: RawProduct) => void;
};

export const getRawProductColumns = (
	meta: ColumnMeta,
): ColumnDef<RawProduct>[] => [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => (
			<Link
				href={`/dashboard/raw-products/${row.original.id}`}
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
		accessorKey: "currentStock",
		header: "Stock",
		cell: ({ row }) => {
			const stock = Number(
				row.original.currentStock ?? row.original.totalStock ?? 0,
			);
			const alert = row.original.lowStockAlert
				? Number(row.original.lowStockAlert)
				: null;
			const isLow = alert !== null && stock <= alert;
			const isOut = stock === 0;
			return (
				<Badge
					variant="outline"
					className={
						isOut
							? "border-destructive text-destructive"
							: isLow
								? "border-orange-400 text-orange-600"
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
								router.push(`/dashboard/raw-products/${row.original.id}`)
							}
						>
							<Eye className="mr-2 h-4 w-4" />
							View Details
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => meta.onStockIn(row.original)}>
							<PackagePlus className="mr-2 h-4 w-4" />
							Stock In
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
