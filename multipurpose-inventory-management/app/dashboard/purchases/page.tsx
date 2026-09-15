"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
	Eye,
	MoreHorizontal,
	Pencil,
	ShoppingCart,
	Trash2,
	TrendingUp,
	Wallet,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Modal } from "@/components/appComponents/Modal";
import { MetricCard } from "@/components/appComponents/metric-card";
import DataTable, { type PaginationParams } from "@/components/data-table";
import { CreatePurchaseModal } from "@/components/purchases/createPurchaseModal";
import { EditPurchaseModal } from "@/components/purchases/editPurchaseModal";
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
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/hooks/useCurrency";
import {
	useDeletePurchase,
	useGetDueSummary,
	useGetPurchases,
} from "@/hooks/usePurchases";
import type {
	Purchase,
	PurchasePaymentStatus,
} from "@/lib/api/services/purchase.service";
import { RecordPaymentModal } from "../../../components/purchases/recordPaymentModal";

const STATUS_STYLES: Record<PurchasePaymentStatus, string> = {
	PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
	PARTIALLY_PAID: "bg-amber-50 text-amber-700 border-amber-200",
	UNPAID: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<PurchasePaymentStatus, string> = {
	PAID: "Paid",
	PARTIALLY_PAID: "Partially Paid",
	UNPAID: "Unpaid",
};

type DatePreset = "ALL" | "TODAY" | "WEEK" | "MONTH" | "YEAR" | "CUSTOM";

const DATE_PRESET_LABELS: Record<DatePreset, string> = {
	ALL: "All Time",
	TODAY: "Today",
	WEEK: "This Week",
	MONTH: "This Month",
	YEAR: "This Year",
	CUSTOM: "Custom Range",
};

const getDateRange = (
	preset: DatePreset,
	customStart: string,
	customEnd: string,
): { startDate?: string; endDate?: string } => {
	const now = new Date();

	switch (preset) {
		case "TODAY": {
			const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			return { startDate: start.toISOString(), endDate: now.toISOString() };
		}
		case "WEEK": {
			const day = now.getDay();
			const diffToMonday = day === 0 ? -6 : 1 - day;
			const start = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate() + diffToMonday,
			);
			return { startDate: start.toISOString(), endDate: now.toISOString() };
		}
		case "MONTH": {
			const start = new Date(now.getFullYear(), now.getMonth(), 1);
			return { startDate: start.toISOString(), endDate: now.toISOString() };
		}
		case "YEAR": {
			const start = new Date(now.getFullYear(), 0, 1);
			return { startDate: start.toISOString(), endDate: now.toISOString() };
		}
		case "CUSTOM": {
			return {
				startDate: customStart
					? new Date(`${customStart}T00:00:00`).toISOString()
					: undefined,
				endDate: customEnd
					? new Date(`${customEnd}T23:59:59`).toISOString()
					: undefined,
			};
		}
		default:
			return { startDate: undefined, endDate: undefined };
	}
};

export default function PurchasesPage() {
	const [tableParams, setTableParams] = useState<PaginationParams>({
		page: 1,
		pageSize: 10,
	});
	const [statusFilter, setStatusFilter] = useState<
		PurchasePaymentStatus | "ALL"
	>("ALL");
	const [dueOnly, setDueOnly] = useState(false);
	const [datePreset, setDatePreset] = useState<DatePreset>("ALL");
	const [customStart, setCustomStart] = useState("");
	const [customEnd, setCustomEnd] = useState("");

	const [createOpen, setCreateOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<Purchase | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Purchase | null>(null);
	const [paymentTarget, setPaymentTarget] = useState<Purchase | null>(null);
	const { symbol } = useCurrency();

	const { startDate, endDate } = getDateRange(
		datePreset,
		customStart,
		customEnd,
	);

	const { data: result, isLoading } = useGetPurchases({
		...tableParams,
		...(statusFilter !== "ALL" && { paymentStatus: statusFilter }),
		...(dueOnly && { dueOnly: true }),
		...(startDate && { startDate }),
		...(endDate && { endDate }),
	});
	const { data: dueSummary } = useGetDueSummary();

	const purchases = result?.data ?? [];
	const totalCount = result?.meta?.total ?? 0;

	const { mutate: deletePurchase, isPending: isDeleting } = useDeletePurchase();

	const resetPage = () => setTableParams((prev) => ({ ...prev, page: 1 }));

	const columns = useMemo<ColumnDef<Purchase>[]>(
		() => [
			{
				accessorKey: "id",
				header: "Purchase ID",
				cell: ({ row }) => (
					<Link
						href={`/dashboard/purchases/${row.original.id}`}
						className="font-mono text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
					>
						#{row.original.id.slice(0, 8).toUpperCase()}
					</Link>
				),
			},
			{
				id: "products",
				header: "Products",
				cell: ({ row }) => {
					const stocks = row.original.productStocks ?? [];
					if (stocks.length === 0)
						return <span className="text-muted-foreground text-sm">—</span>;
					return (
						<div className="space-y-1">
							{stocks.slice(0, 2).map((s) => (
								<Link
									href={`/dashboard/products/${s.product?.id}`}
									key={s.id}
									className="text-sm hover:underline"
								>
									<span className="font-medium">
										{s.product?.name ?? "Unknown"}
									</span>
									<span className="text-muted-foreground ml-1 text-xs">
										× {Number(s.quantity).toFixed(2)} {s.unit?.symbol ?? ""}
									</span>
								</Link>
							))}
							{stocks.length > 2 && (
								<Badge variant="secondary" className="text-xs">
									+{stocks.length - 2} more
								</Badge>
							)}
						</div>
					);
				},
			},
			{
				id: "supplier",
				header: "Supplier",
				cell: ({ row }) =>
					row.original.supplier ? (
						<span className="text-sm">{row.original.supplier.name}</span>
					) : (
						<span className="text-muted-foreground text-sm">—</span>
					),
			},
			{
				accessorKey: "totalCost",
				header: "Total Cost",
				cell: ({ row }) => (
					<span className="font-semibold text-sm tabular-nums">
						{symbol}
						{Number(row.original.totalCost).toFixed(2)}
					</span>
				),
			},
			{
				id: "due",
				header: "Due",
				cell: ({ row }) => {
					const due = Number(row.original.due);
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
				id: "paymentStatus",
				header: "Status",
				cell: ({ row }) => (
					<Badge
						variant="outline"
						className={STATUS_STYLES[row.original.paymentStatus]}
					>
						{STATUS_LABELS[row.original.paymentStatus]}
					</Badge>
				),
			},
			{
				id: "date",
				header: "Date",
				cell: ({ row }) => (
					<span className="text-sm text-muted-foreground whitespace-nowrap">
						{new Date(row.original.createdAt).toLocaleDateString("en-US", {
							year: "numeric",
							month: "short",
							day: "numeric",
						})}
					</span>
				),
			},
			{
				id: "actions",
				header: "Actions",
				size: 60,
				cell: ({ row }) => (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<Link href={`/dashboard/purchases/${row.original.id}`}>
									<Eye className="mr-2 h-4 w-4" />
									View Details
								</Link>
							</DropdownMenuItem>
							{Number(row.original.due) > 0 && (
								<DropdownMenuItem
									onClick={() => setPaymentTarget(row.original)}
								>
									<Wallet className="mr-2 h-4 w-4" />
									Record Payment
								</DropdownMenuItem>
							)}
							<DropdownMenuItem onClick={() => setEditTarget(row.original)}>
								<Pencil className="mr-2 h-4 w-4" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="text-destructive focus:text-destructive"
								onClick={() => setDeleteTarget(row.original)}
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				),
			},
		],
		[symbol],
	);

	return (
		<div className="container mx-auto p-6 space-y-4">
			<div className="grid gap-4 md:grid-cols-4">
				<MetricCard
					title="Total Purchases"
					value={totalCount.toString()}
					icon={ShoppingCart}
				/>
				<MetricCard
					title="Total Purchased"
					value={`${symbol}${Number(dueSummary?.totalPurchased ?? 0).toFixed(2)}`}
					icon={TrendingUp}
				/>
				<MetricCard
					title="Total Paid"
					value={`${symbol}${Number(dueSummary?.totalPaid ?? 0).toFixed(2)}`}
					icon={Wallet}
				/>
				<MetricCard
					title="Total Due"
					value={`${symbol}${Number(dueSummary?.totalDue ?? 0).toFixed(2)}`}
					icon={Wallet}
				/>
			</div>

			<div className="flex flex-col gap-3 rounded-lg border p-4">
				<div className="flex flex-wrap items-center gap-3">
					<Select
						value={statusFilter}
						onValueChange={(value) => {
							setStatusFilter(value as PurchasePaymentStatus | "ALL");
							resetPage();
						}}
					>
						<SelectTrigger className="w-[170px]">
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">All Statuses</SelectItem>
							<SelectItem value="UNPAID">Unpaid</SelectItem>
							<SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
							<SelectItem value="PAID">Paid</SelectItem>
						</SelectContent>
					</Select>

					<Select
						value={datePreset}
						onValueChange={(value) => {
							setDatePreset(value as DatePreset);
							resetPage();
						}}
					>
						<SelectTrigger className="w-[160px]">
							<SelectValue placeholder="Date range" />
						</SelectTrigger>
						<SelectContent>
							{(Object.keys(DATE_PRESET_LABELS) as DatePreset[]).map((key) => (
								<SelectItem key={key} value={key}>
									{DATE_PRESET_LABELS[key]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Button
						type="button"
						variant={dueOnly ? "default" : "outline"}
						size="sm"
						onClick={() => {
							setDueOnly((prev) => !prev);
							resetPage();
						}}
					>
						<Wallet className="mr-2 h-3.5 w-3.5" />
						Due Only
					</Button>

					<div className="flex-1" />

					<Modal
						open={createOpen}
						onOpenChange={setCreateOpen}
						trigger={<Button>+ New Purchase</Button>}
						title="Create Purchase"
						className="w-full"
					>
						<CreatePurchaseModal onClose={() => setCreateOpen(false)} />
					</Modal>
				</div>

				{datePreset === "CUSTOM" && (
					<div className="flex flex-wrap items-center gap-3">
						<div className="flex items-center gap-2">
							<span className="text-xs text-muted-foreground">From</span>
							<Input
								type="date"
								value={customStart}
								onChange={(e) => {
									setCustomStart(e.target.value);
									resetPage();
								}}
								className="w-[150px]"
							/>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-xs text-muted-foreground">To</span>
							<Input
								type="date"
								value={customEnd}
								onChange={(e) => {
									setCustomEnd(e.target.value);
									resetPage();
								}}
								className="w-[150px]"
							/>
						</div>
					</div>
				)}
			</div>

			<Modal
				open={!!paymentTarget}
				onOpenChange={(open) => {
					if (!open) setPaymentTarget(null);
				}}
				title="Record Payment"
			>
				{paymentTarget && (
					<RecordPaymentModal
						purchase={paymentTarget}
						onClose={() => setPaymentTarget(null)}
					/>
				)}
			</Modal>

			<Modal
				open={!!editTarget}
				onOpenChange={(open) => {
					if (!open) setEditTarget(null);
				}}
				title="Edit Purchase"
			>
				{editTarget && (
					<EditPurchaseModal
						purchase={editTarget}
						onClose={() => setEditTarget(null)}
					/>
				)}
			</Modal>

			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={(o) => !o && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<Trash2 className="h-5 w-5 text-destructive" />
							Delete Purchase?
						</AlertDialogTitle>
						<AlertDialogDescription>
							Purchase{" "}
							<span className="font-mono font-semibold">
								#{deleteTarget?.id.slice(0, 8).toUpperCase()}
							</span>{" "}
							will be permanently deleted. This cannot be undone.
							{deleteTarget && Number(deleteTarget.paidAmount) > 0 && (
								<span className="block mt-2 text-destructive font-medium">
									This purchase has {Number(deleteTarget.paidAmount).toFixed(2)}{" "}
									already paid — deletion will be blocked until payments are
									reversed.
								</span>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={() => {
								if (deleteTarget) {
									deletePurchase(deleteTarget.id, {
										onSuccess: () => setDeleteTarget(null),
									});
								}
							}}
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<DataTable
				title="Purchases"
				columns={columns}
				data={purchases}
				totalCount={totalCount}
				currentPage={tableParams.page}
				pageSize={tableParams.pageSize}
				onPaginationChange={setTableParams}
				loading={isLoading}
				searchPlaceholder="Search purchases..."
			/>
		</div>
	);
}
