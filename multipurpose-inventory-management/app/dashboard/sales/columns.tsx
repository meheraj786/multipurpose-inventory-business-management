"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
	Edit,
	Eye,
	FileText,
	MoreHorizontal,
	Trash2,
	Wallet,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Sale, SaleInvoice } from "@/hooks/useSale";
import { calculateSaleFinancials } from "@/lib/api/services/sale.service";
import { PAYMENT_METHOD_LABELS } from "@/validation/sale.schema";

type ColumnMeta = {
	onEdit: (sale: Sale) => void;
	onDelete: (sale: Sale) => void;
	onCollectDue: (sale: Sale) => void;
	onViewInvoice: (invoice: SaleInvoice, sale: Sale) => void;
};

export const getSaleColumns = (
	meta: ColumnMeta,
	symbol: string,
): ColumnDef<Sale>[] => [
	{
		accessorKey: "id",
		header: "Sale ID",
		cell: ({ row }) => {
			const hasReturns = (row.original.customerReturns ?? []).length > 0;
			return (
				<div className="flex flex-col gap-1">
					<Link
						href={`/dashboard/sales/${row.original.id}`}
						className="font-mono hover:underline cursor-pointer text-xs text-muted-foreground"
					>
						#{row.original.id.slice(0, 8).toUpperCase()}
					</Link>
					{hasReturns && (
						<div>
							<Badge
								variant="outline"
								className="h-4 px-1 text-[8px] bg-red-50 text-red-700 border-red-200 uppercase font-mono"
							>
								Returned
							</Badge>
						</div>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "customer",
		header: "Customer",
		cell: ({ row }) => {
			const { customer, customerNumber } = row.original;
			if (customer)
				return (
					<Link
						href={`/dashboard/customers/${customer.id}`}
						className="flex flex-col cursor-pointer hover:underline"
					>
						<p className="font-medium">{customer.name}</p>
						<p className="text-xs text-muted-foreground">{customer.phone}</p>
					</Link>
				);
			if (customerNumber)
				return <span className="text-sm">{customerNumber}</span>;
			return <span className="text-muted-foreground text-sm">Walk-in</span>;
		},
	},
	{
		accessorKey: "paymentMethod",
		header: "Payment",
		cell: ({ row }) => {
			const method = row.original.paymentMethod;
			const label =
				PAYMENT_METHOD_LABELS[method as keyof typeof PAYMENT_METHOD_LABELS] ??
				method.replace(/_/g, " ");
			return (
				<span className="text-xs font-medium px-2 py-1 rounded-full bg-muted">
					{label}
				</span>
			);
		},
	},
	{
		id: "total",
		header: "Total",
		cell: ({ row }) => {
			const financials = calculateSaleFinancials(row.original);
			return (
				<span className="font-medium tabular-nums">
					{symbol}
					{financials.adjustedGrandTotal.toFixed(2)}
				</span>
			);
		},
	},
	{
		accessorKey: "due",
		header: "Due",
		cell: ({ row }) => {
			const due = Number(row.original.due ?? 0);
			if (due <= 0)
				return <span className="text-muted-foreground text-sm">—</span>;
			return (
				<span className="text-destructive font-medium tabular-nums">
					{symbol}
					{due.toFixed(2)}
				</span>
			);
		},
	},
	{
		accessorKey: "invoices",
		header: "Invoice",
		cell: ({ row }) => {
			const invoice = row.original.invoices?.[0];
			if (!invoice) {
				return <span className="text-muted-foreground text-xs">—</span>;
			}
			return (
				<Button
					variant="outline"
					size="sm"
					className="h-8 gap-1"
					onClick={() => meta.onViewInvoice(invoice, row.original)}
				>
					<FileText className="h-3.5 w-3.5" />
					View
				</Button>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: "Date",
		cell: ({ row }) =>
			new Date(row.original.createdAt).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
			}),
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const sale = row.original;
			const hasDue = Number(sale.due ?? 0) > 0;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem asChild>
							<Link
								href={`/dashboard/sales/${sale.id}`}
								className="flex w-full items-center"
							>
								<Eye className="mr-2 h-4 w-4" />
								View Details
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => meta.onEdit(sale)}>
							<Edit className="mr-2 h-4 w-4" />
							Edit Details
						</DropdownMenuItem>
						{hasDue && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="text-orange-600 focus:text-orange-600"
									onClick={() => meta.onCollectDue(sale)}
								>
									<Wallet className="mr-2 h-4 w-4" />
									Collect Due ({symbol}
									{Number(sale.due).toFixed(2)})
								</DropdownMenuItem>
							</>
						)}
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="text-destructive focus:text-destructive"
							onClick={() => meta.onDelete(sale)}
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
