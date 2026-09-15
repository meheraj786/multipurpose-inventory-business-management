import type { ColumnDef } from "@tanstack/react-table";
import { ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PreparedProduct } from "@/lib/api/services/preparedProduct.service";

type Handlers = {
	onProduce: (product: PreparedProduct) => void;
};

export const getPreparedProductStockColumns = (
	handlers: Handlers,
): ColumnDef<PreparedProduct>[] => [
	{
		accessorKey: "name",
		header: "Menu Item",
		cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
	},
	{
		id: "unit",
		header: "Unit",
		cell: ({ row }) => row.original.unit?.symbol ?? "—",
	},
	{
		id: "recipe",
		header: "Recipe",
		cell: ({ row }) => {
			const count = row.original.preparedProductItems?.length ?? 0;
			if (count === 0) return <span className="text-muted-foreground">—</span>;
			return (
				<span className="text-sm text-muted-foreground">
					{count} ingredient{count === 1 ? "" : "s"}
				</span>
			);
		},
	},
	{
		id: "stock",
		header: "Current Stock",
		cell: ({ row }) => (
			<span className="tabular-nums">
				{row.original.totalStock} {row.original.unit?.symbol}
			</span>
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
					onClick={() => handlers.onProduce(row.original)}
				>
					<ChefHat className="mr-1 h-3.5 w-3.5" />
					Produce
				</Button>
			</div>
		),
	},
];
