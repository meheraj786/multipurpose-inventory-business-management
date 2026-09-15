"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Tag, Trash2 } from "lucide-react";
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
import type { SubCategoryData } from "@/validation/subcategory.schema";

type ColumnCallbacks = {
	onEdit: (sub: SubCategoryData) => void;
	onDelete: (sub: SubCategoryData) => void;
};

export const createSubCategoryColumns = (
	callbacks: ColumnCallbacks,
): ColumnDef<SubCategoryData>[] => [
	{
		accessorKey: "name",
		header: createSortableHeader("Subcategory Name"),
		cell: ({ row }) => (
			<div className="flex items-center gap-2 font-medium">
				<Tag className="h-4 w-4 text-muted-foreground" />
				{row.original.name}
			</div>
		),
	},
	{
		id: "parentCategory",
		header: "Parent Category",
		cell: ({ row }) => {
			const parent = row.original.category;
			return parent ? (
				<Badge variant="outline">{parent.name}</Badge>
			) : (
				<span className="text-muted-foreground">—</span>
			);
		},
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
		id: "actions",
		size: 60,
		header: "Actions",
		cell: ({ row }) => {
			const sub = row.original;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => callbacks.onEdit(sub)}>
							<Pencil className="mr-2 h-4 w-4" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="text-destructive focus:text-destructive"
							onClick={() => callbacks.onDelete(sub)}
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
