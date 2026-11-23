"use client";

import {
	DollarSign,
	Receipt,
	ShoppingCart,
	Trash2,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Modal } from "@/components/appComponents/Modal";
import { MetricCard } from "@/components/appComponents/metric-card";
import DataTable, { type PaginationParams } from "@/components/data-table";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCurrency } from "@/hooks/useCurrency";
import {
	type Sale,
	type SaleInvoice,
	useDeleteSale,
	useGetSales,
} from "@/hooks/useSale";
import {
	calculateSaleFinancials,
	type SaleQueryParams,
} from "@/lib/api/services/sale.service";
import { InvoiceViewer } from "./[id]/invoice-viewer";
import { CollectDueModal } from "./collectDueModal";
import { getSaleColumns } from "./columns";
import { EditSaleModal } from "./editSaleModal";

type DatePreset = "all" | "today" | "week" | "month" | "year" | "custom";

function getDateRange(
	preset: DatePreset,
): { start: string; end: string } | null {
	const now = new Date();
	const format = (d: Date) => d.toISOString().split("T")[0];
	const start = new Date(now);

	switch (preset) {
		case "today":
			return { start: format(start), end: format(now) };
		case "week": {
			const day = start.getDay();
			const diff = start.getDate() - day + (day === 0 ? -6 : 1);
			start.setDate(diff);
			return { start: format(start), end: format(now) };
		}
		case "month":
			start.setDate(1);
			return { start: format(start), end: format(now) };
		case "year":
			start.setMonth(0, 1);
			return { start: format(start), end: format(now) };
		default:
			return null;
	}
}

export default function SalesPage() {
	const [editTarget, setEditTarget] = useState<Sale | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null);
	const [dueTarget, setDueTarget] = useState<Sale | null>(null);
	const [activeInvoice, setActiveInvoice] = useState<SaleInvoice | null>(null);
	const [activeInvoiceSale, setActiveInvoiceSale] = useState<Sale | null>(null);
	const { symbol } = useCurrency();

	// Filter state
	const [datePreset, setDatePreset] = useState<DatePreset>("all");
	const [customStart, setCustomStart] = useState("");
	const [customEnd, setCustomEnd] = useState("");
	const [dueOnly, setDueOnly] = useState(false);

	const [tableParams, setTableParams] = useState<PaginationParams>({
		page: 1,
		pageSize: 10,
	});

	// Build query params
	const queryParams = useMemo(() => {
		const params: SaleQueryParams = { ...tableParams };
		if (datePreset === "custom") {
			if (customStart) params.startDate = customStart;
			if (customEnd) params.endDate = customEnd;
		} else {
			const range = getDateRange(datePreset);
			if (range) {
				params.startDate = range.start;
				params.endDate = range.end;
			}
		}
		if (dueOnly) params.dueOnly = true;
		return params;
	}, [tableParams, datePreset, customStart, customEnd, dueOnly]);

	const { data: result, isLoading } = useGetSales(queryParams);
	const sales = result?.data ?? [];
	const totalCount = result?.meta.total ?? 0;

	const { mutate: deleteSale, isPending: isDeleting } = useDeleteSale();

	const totalRevenue = sales.reduce(
		(sum, sale) => sum + calculateSaleFinancials(sale).adjustedGrandTotal,
		0,
	);

	const totalDue = sales.reduce((sum, sale) => sum + Number(sale.due ?? 0), 0);
	const salesWithDue = sales.filter((s) => Number(s.due ?? 0) > 0).length;

	const columns = useMemo(
		() =>
			getSaleColumns(
				{
					onEdit: (sale) => setEditTarget(sale),
					onDelete: (sale) => setDeleteTarget(sale),
					onCollectDue: (sale) => setDueTarget(sale),
					onViewInvoice: (invoice, sale) => {
						setActiveInvoice(invoice);
						setActiveInvoiceSale(sale);
					},
				},
				symbol,
			),
		[symbol],
	);

	return (
		<div className="container mx-auto p-6 space-y-4">
			<div className="grid gap-4 md:grid-cols-4">
				<MetricCard
					title="Total Sales"
					value={totalCount.toString()}
					icon={ShoppingCart}
				/>
				<MetricCard
					title="Revenue (Page)"
					value={`${symbol}${totalRevenue.toFixed(2)}`}
					icon={TrendingUp}
				/>
				<MetricCard
					title="Total Due (Page)"
					value={`${symbol}${totalDue.toFixed(2)}`}
					icon={DollarSign}
				/>
				<MetricCard
					title="Sales with Due"
					value={salesWithDue.toString()}
					icon={Receipt}
				/>
			</div>

			<div className="flex justify-end">
				<Link href="/dashboard/sales/create">
					<Button>+ Create Sale</Button>
				</Link>
			</div>
			{/* Filter bar */}
			<div className="flex flex-wrap items-end gap-4 p-4 bg-muted/30 rounded-lg">
				<div className="space-y-1">
					<Label className="text-xs">Date Range</Label>
					<Select
						value={datePreset}
						onValueChange={(v) => setDatePreset(v as DatePreset)}
					>
						<SelectTrigger className="w-40">
							<SelectValue placeholder="Select" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Time</SelectItem>
							<SelectItem value="today">Today</SelectItem>
							<SelectItem value="week">This Week</SelectItem>
							<SelectItem value="month">This Month</SelectItem>
							<SelectItem value="year">This Year</SelectItem>
							<SelectItem value="custom">Custom Range</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{datePreset === "custom" && (
					<>
						<div className="space-y-1">
							<Label className="text-xs">Start</Label>
							<Input
								type="date"
								className="w-36 h-9"
								value={customStart}
								onChange={(e) => setCustomStart(e.target.value)}
							/>
						</div>
						<div className="space-y-1">
							<Label className="text-xs">End</Label>
							<Input
								type="date"
								className="w-36 h-9"
								value={customEnd}
								onChange={(e) => setCustomEnd(e.target.value)}
							/>
						</div>
					</>
				)}

				<div className="flex items-center gap-2 self-end mb-1">
					<Switch
						id="due-only"
						checked={dueOnly}
						onCheckedChange={setDueOnly}
					/>
					<Label htmlFor="due-only" className="text-xs cursor-pointer">
						Due only
					</Label>
				</div>

				<Button
					variant="outline"
					size="sm"
					onClick={() => {
						setDatePreset("all");
						setCustomStart("");
						setCustomEnd("");
						setDueOnly(false);
					}}
					className="self-end h-9"
				>
					Reset Filters
				</Button>
			</div>
			{/* Modals (unchanged) */}
			<Modal
				open={!!editTarget}
				onOpenChange={(open) => {
					if (!open) setEditTarget(null);
				}}
				title="Edit Sale"
			>
				{editTarget && (
					<EditSaleModal
						sale={editTarget}
						onClose={() => setEditTarget(null)}
					/>
				)}
			</Modal>

			<Modal
				open={!!dueTarget}
				onOpenChange={(open) => {
					if (!open) setDueTarget(null);
				}}
				title="Collect Due Payment"
			>
				{dueTarget && (
					<CollectDueModal
						sale={dueTarget}
						onClose={() => setDueTarget(null)}
					/>
				)}
			</Modal>

			<Modal
				open={!!activeInvoice}
				onOpenChange={(open) => {
					if (!open) {
						setActiveInvoice(null);
						setActiveInvoiceSale(null);
					}
				}}
				title="Invoice"
				className="max-w-3xl h-[90vh]"
			>
				{activeInvoice && activeInvoiceSale && (
					<InvoiceViewer
						invoice={activeInvoice}
						sale={activeInvoiceSale}
						onClose={() => {
							setActiveInvoice(null);
							setActiveInvoiceSale(null);
						}}
					/>
				)}
			</Modal>

			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<Trash2 className="h-5 w-5 text-destructive" />
							Delete Sale?
						</AlertDialogTitle>
						<AlertDialogDescription>
							Sale{" "}
							<span className="font-mono font-semibold">
								#{deleteTarget?.id.slice(0, 8).toUpperCase()}
							</span>{" "}
							will be permanently deleted. This cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={() => {
								if (deleteTarget) {
									deleteSale(deleteTarget.id, {
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
				title="Sales"
				columns={columns}
				data={sales}
				totalCount={totalCount}
				currentPage={tableParams.page}
				pageSize={tableParams.pageSize}
				onPaginationChange={setTableParams}
				loading={isLoading}
				searchPlaceholder="Search by customer..."
			/>
		</div>
	);
}
