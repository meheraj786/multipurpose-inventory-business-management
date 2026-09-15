"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal } from "lucide-react"; // Added Eye icon
import Link from "next/link"; // Added Link
import { createSortableHeader } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CustomerData } from "@/validation/customer.schema";

type CustomerColumnsProps = {
	onEdit: (customer: CustomerData) => void;
	onDelete: (customer: CustomerData) => void;
};

export const createCustomerColumns = ({
	onEdit,
	onDelete,
}: CustomerColumnsProps): ColumnDef<CustomerData>[] => [
	{
		accessorKey: "name",
		header: createSortableHeader("Name"),
		// Updated: Name now links to the detail page
		cell: ({ row }) => (
			<Link
				href={`/dashboard/customers/${row.original.id}`}
				className="font-medium hover:underline text-primary"
			>
				{row.original.name}
			</Link>
		),
	},
	{
		accessorKey: "phone",
		header: "Phone",
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) =>
			row.original.email ?? <span className="text-muted-foreground">—</span>,
	},
	{
		accessorKey: "address",
		header: "Address",
		cell: ({ row }) =>
			row.original.address ?? <span className="text-muted-foreground">—</span>,
	},
	// {
	// 	accessorKey: "hasMembership",
	// 	header: "Membership",
	// 	cell: ({ row }) =>
	// 		row.original.hasMembership ? (
	// 			<Badge
	// 				variant="default"
	// 				className="bg-emerald-500 hover:bg-emerald-600"
	// 			>
	// 				Member
	// 			</Badge>
	// 		) : (
	// 			<Badge variant="outline">No Membership</Badge>
	// 		),
	// },
	{
		id: "actions",
		size: 10,
		header: "Actions",
		cell: ({ row }) => {
			const customer = row.original;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-40">
						{/* Added: View Details Option */}
						<DropdownMenuItem asChild>
							<Link href={`/dashboard/customers/${customer.id}`}>
								<Eye className="mr-2 h-4 w-4 text-muted-foreground" />
								View Details
							</Link>
						</DropdownMenuItem>

						<DropdownMenuItem onClick={() => onEdit(customer)}>
							Edit Info
						</DropdownMenuItem>

						<DropdownMenuItem
							className="text-red-600 focus:text-red-600 focus:bg-red-50"
							onClick={() => onDelete(customer)}
						>
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
