import type { ColumnDef } from "@tanstack/react-table";
import { PackagePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RawProduct } from "@/lib/api/services/rawProduct.service";

type Handlers = {
	onAddStock: (product: RawProduct) => void;
};

export const getRawProductStockColumns = (
	handlers: Handlers,
): ColumnDef<RawProduct>[] => [
	{
		accessorKey: "name",
		header: "Raw Product",
		cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
	},
	{
		id: "category",
		header: "Category",
		cell: ({ row }) => row.original.category?.name ?? "—",
	},
	{
		id: "unit",
		header: "Unit",
		cell: ({ row }) => row.original.unit?.symbol ?? "—",
	},
	{
		id: "stock",
		header: "Current Stock",
		cell: ({ row }) => {
			const product = row.original;
			const stock = product.currentStock ?? product.totalStock ?? 0;
			return (
				<span className="tabular-nums">
					{stock} {product.unit?.symbol}
				</span>
			);
		},
	},
	{
		id: "lowStockAlert",
		header: "Low Stock Alert",
		cell: ({ row }) =>
			row.original.lowStockAlert ? (
				<Badge variant="outline">{row.original.lowStockAlert}</Badge>
			) : (
				<span className="text-muted-foreground">—</span>
			),
	},
	{
		id: "actions",
		header: "",
		cell: ({ row }) => (
			<div className="flex justify-end">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => handlers.onAddStock(row.original)}
				>
					<PackagePlus className="mr-1 h-3.5 w-3.5" />
					Add Stock
				</Button>
			</div>
		),
	},
];
