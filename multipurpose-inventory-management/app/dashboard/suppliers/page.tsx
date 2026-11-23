"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
	Eye,
	MoreHorizontal,
	Pencil,
	Power,
	Trash2,
	Users,
	Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Modal } from "@/components/appComponents/Modal";
import { MetricCard } from "@/components/appComponents/metric-card";
import DataTable, { type PaginationParams } from "@/components/data-table";
import { SupplierFormModal } from "@/components/suppliers/supplierFormModal";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/hooks/useCurrency";
import {
	type Supplier,
	useDeleteSupplier,
	useGetSuppliers,
	useToggleSupplierActive,
} from "@/hooks/useSuppliers";

export default function SuppliersPage() {
	const router = useRouter();
	const { symbol } = useCurrency();

	const [tableParams, setTableParams] = useState<PaginationParams>({
		page: 1,
		pageSize: 10,
	});
	const [dueOnly, setDueOnly] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);
	const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

	const { data: result, isLoading } = useGetSuppliers({
		...tableParams,
		...(dueOnly && { hasDue: true }),
	});
	const suppliers = result?.data ?? [];
	const totalCount = result?.meta.total ?? 0;
	const activeCount = suppliers.filter((s) => s.isActive).length;
	const totalDueOnPage = suppliers.reduce(
		(sum, s) => sum + Number(s.totalDue ?? 0),
		0,
	);

	const { mutate: deleteSupplier, isPending: isDeleting } = useDeleteSupplier();
	const { mutate: toggleActive } = useToggleSupplierActive();

	const columns = useMemo<ColumnDef<Supplier>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Supplier",
				cell: ({ row }) => (
					<Link
						href={`/dashboard/suppliers/${row.original.id}`}
						className="hover:underline"
					>
						<p className="font-medium text-sm">{row.original.name}</p>
						{row.original.companyName && (
							<p className="text-xs text-muted-foreground">
								{row.original.companyName}
							</p>
						)}
					</Link>
				),
			},
			{
				accessorKey: "contact",
				header: "Contact",
				cell: ({ row }) => (
					<div>
						<p className="text-sm">{row.original.contact}</p>
						{row.original.email && (
							<p className="text-xs text-muted-foreground">
								{row.original.email}
							</p>
						)}
					</div>
				),
			},
			{
				accessorKey: "address",
				header: "Address",
				cell: ({ row }) => (
					<span className="text-sm text-muted-foreground">
						{row.original.address ?? "—"}
					</span>
				),
			},
			{
				accessorKey: "isActive",
				header: "Status",
				cell: ({ row }) =>
					row.original.isActive ? (
						<Badge className="bg-green-100 text-green-700 hover:bg-green-100">
							Active
						</Badge>
					) : (
						<Badge variant="secondary">Inactive</Badge>
					),
			},
			{
				accessorKey: "_count",
				header: "Purchases",
				cell: ({ row }) => (
					<span className="text-sm">{row.original._count?.purchases ?? 0}</span>
				),
			},
			{
				id: "due",
				header: "Due",
				cell: ({ row }) => {
					const due = Number(row.original.totalDue ?? 0);
					return (
						<span
							className={`text-sm tabular-nums font-medium ${
								due > 0 ? "text-destructive" : "text-muted-foreground"
							}`}
						>
							{symbol}
							{due.toFixed(2)}
						</span>
					);
				},
			},
			{
				id: "actions",
				header: "Actions",
				size: 60,
				cell: ({ row }) => {
					const supplier = row.original;
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
										router.push(`/dashboard/suppliers/${supplier.id}`)
									}
								>
									<Eye className="mr-2 h-4 w-4" />
									View Details
								</DropdownMenuItem>

								<DropdownMenuItem onClick={() => setEditSupplier(supplier)}>
									<Pencil className="mr-2 h-4 w-4" />
									Edit
								</DropdownMenuItem>

								<DropdownMenuItem onClick={() => toggleActive(supplier.id)}>
									<Power className="mr-2 h-4 w-4" />
									{supplier.isActive ? "Deactivate" : "Activate"}
								</DropdownMenuItem>

								<DropdownMenuSeparator />

								<DropdownMenuItem
									className="text-destructive focus:text-destructive"
									onClick={() => setDeleteTarget(supplier)}
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[router, toggleActive, symbol],
	);

	return (
		<div className="container mx-auto p-6 space-y-4">
			<div className="grid gap-4 md:grid-cols-4">
				<MetricCard
					title="Total Suppliers"
					value={totalCount.toString()}
					icon={Users}
				/>
				<MetricCard
					title="Active"
					value={activeCount.toString()}
					icon={Users}
				/>
				<MetricCard
					title="Inactive"
					value={(totalCount - activeCount).toString()}
					icon={Users}
				/>
				<MetricCard
					title="Due (this page)"
					value={`${symbol}${totalDueOnPage.toFixed(2)}`}
					icon={Wallet}
					className={`${totalDueOnPage > 0 ? "text-destructive" : ""}`}
				/>
			</div>

			<div className="flex items-center justify-between gap-3">
				<Button
					type="button"
					variant={dueOnly ? "default" : "outline"}
					size="sm"
					onClick={() => {
						setDueOnly((prev) => !prev);
						setTableParams((prev) => ({ ...prev, page: 1 }));
					}}
				>
					<Wallet className="mr-2 h-3.5 w-3.5" />
					Has Due
				</Button>

				<Modal
					open={createOpen}
					onOpenChange={setCreateOpen}
					trigger={<Button>+ New Supplier</Button>}
					title="Create Supplier"
				>
					<SupplierFormModal onClose={() => setCreateOpen(false)} />
				</Modal>
			</div>

			<Modal
				open={!!editSupplier}
				onOpenChange={(o) => !o && setEditSupplier(null)}
				title="Edit Supplier"
			>
				{editSupplier && (
					<SupplierFormModal
						supplier={editSupplier}
						onClose={() => setEditSupplier(null)}
					/>
				)}
			</Modal>

			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={(o) => !o && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete supplier?</AlertDialogTitle>
						<AlertDialogDescription>
							&quot;{deleteTarget?.name}&quot; will be moved to trash. You can
							restore it later.
							{deleteTarget && Number(deleteTarget.totalDue ?? 0) > 0 && (
								<span className="block mt-2 text-destructive font-medium">
									This supplier has {symbol}
									{Number(deleteTarget.totalDue ?? 0).toFixed(2)} in outstanding
									due across their purchases.
								</span>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={() => {
								if (deleteTarget) {
									deleteSupplier(deleteTarget.id, {
										onSuccess: () => setDeleteTarget(null),
									});
								}
							}}
						>
							{isDeleting ? "Deleting..." : "Move to Trash"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<DataTable
				title="Suppliers"
				columns={columns}
				data={suppliers}
				totalCount={totalCount}
				currentPage={tableParams.page}
				pageSize={tableParams.pageSize}
				onPaginationChange={setTableParams}
				loading={isLoading}
				searchPlaceholder="Search suppliers..."
			/>
		</div>
	);
}
