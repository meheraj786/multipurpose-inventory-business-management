"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { createSortableHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CategoryData } from "@/validation/category.schema";

type ColumnCallbacks = {
	onEdit: (category: CategoryData) => void;
	onDelete: (category: CategoryData) => void;
};

export const createCategoryColumns = (
	callbacks: ColumnCallbacks,
): ColumnDef<CategoryData>[] => [
	{
		accessorKey: "name",
		header: createSortableHeader("Category Name"),
	},
	{
		accessorKey: "description",
		header: "Description",
		cell: ({ row }) =>
			row.original.description ? (
				<span>{row.original.description}</span>
			) : (
				<span className="text-muted-foreground">—</span>
			),
	},
	{
		accessorKey: "features",
		header: "Features",
		cell: ({ row }) => {
			const features = row.original.features ?? [];
			if (features.length === 0)
				return <span className="text-muted-foreground">—</span>;
			return (
				<div className="flex gap-1 flex-wrap">
					{features.map((f) => (
						<Badge key={f} variant="outline">
							{f}
						</Badge>
					))}
				</div>
			);
		},
	},
	{
		id: "subcategories",
		header: "Subcategories",
		cell: ({ row }) => {
			const subs = row.original.subCategories ?? [];
			if (subs.length === 0)
				return <span className="text-muted-foreground">None</span>;
			if (subs.length === 1) return <span>{subs[0].name}</span>;
			return <span>{subs.length} Subcategories</span>;
		},
	},
	{
		id: "actions",
		size: 60,
		header: "Actions",
		cell: ({ row }) => {
			const category = row.original;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => callbacks.onEdit(category)}>
							<Pencil className="mr-2 h-4 w-4" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="text-destructive focus:text-destructive"
							onClick={() => callbacks.onDelete(category)}
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
