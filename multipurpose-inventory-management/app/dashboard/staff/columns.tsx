"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StaffMember } from "@/hooks/useStaff";

type ColumnMeta = {
	onEdit: (staff: StaffMember) => void;
	onDelete: (id: string) => void;
};

export const getStaffColumns = (meta: ColumnMeta): ColumnDef<StaffMember>[] => [
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => row.original.name ?? "—",
	},
	{
		accessorKey: "customRole",
		header: "Access Role",
		cell: ({ row }) => {
			const role = row.original.customRole;
			const count = role?.permissions.length ?? 0;
			return (
				<span className="text-sm text-muted-foreground">
					{role ? `${role.name} · ${count} modules` : "No role"}
				</span>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: "Joined",
		cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
	},
	{
		id: "actions",
		cell: ({ row }) => (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon">
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => meta.onEdit(row.original)}>
						<Edit className="mr-2 h-4 w-4" />
						Edit Info
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
		),
	},
];
