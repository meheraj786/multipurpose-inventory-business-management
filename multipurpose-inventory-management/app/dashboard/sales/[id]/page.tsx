"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeft,
	BadgePercent,
	Calendar,
	CheckCircle,
	CreditCard,
	DollarSign,
	FileText,
	Info,
	Layers,
	Package,
	Receipt,
	RotateCcw,
	ShoppingCart,
	SquareArrowOutUpRight,
	TrendingUp,
	User,
	Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/appComponents/Modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useCurrency } from "@/hooks/useCurrency";
import { useCreateInvoice, useUpdateInvoice } from "@/hooks/useInvoice";
import type { Sale, SaleInvoice } from "@/hooks/useSale";
import { useGetSingleSale } from "@/hooks/useSale";
import { calculateSaleFinancials } from "@/lib/api/services/sale.service";
import {
	type CreateInvoiceForm,
	createInvoiceSchema,
	type UpdateInvoiceForm,
	updateInvoiceSchema,
} from "@/validation/invoice.schema";
import { CollectDueModal } from "../collectDueModal";
import { InvoiceViewer } from "./invoice-viewer";
import { ReturnItemsModal } from "./returnsItemsModal";

const STATUS_STYLES: Record<string, string> = {
	PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
	PAID: "bg-green-100 text-green-800 border-green-200",
	PARTIALLY_PAID: "bg-blue-100 text-blue-800 border-blue-200",
	CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

interface PaymentRecord {
	method: string;
	amount: number;
	transactionId?: string;
}

export default function SaleDetailPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const queryClient = useQueryClient();
	const [invoiceOpen, setInvoiceOpen] = useState(false);
	const { symbol } = useCurrency();
	const [editingInvoice, setEditingInvoice] = useState<SaleInvoice | null>(
		null,
	);
	const [viewingInvoice, setViewingInvoice] = useState<SaleInvoice | null>(
		null,
	);
	const [dueTarget, setDueTarget] = useState<Sale | null>(null);
	const [isReturnOpen, setIsReturnOpen] = useState(false);

	const { data: sale, isLoading } = useGetSingleSale(id);
	const { mutate: createInvoice } = useCreateInvoice();
	const { mutate: updateInvoice, isPending: isUpdatingInvoice } =
		useUpdateInvoice();

	const hasDue = Number(sale?.due ?? 0) > 0;

	const createInvoiceForm = useForm<CreateInvoiceForm>({
		resolver: zodResolver(createInvoiceSchema),
		defaultValues: {
			billTo: "",
			invoiceDate: new Date().toISOString().slice(0, 10),
			saleId: id,
			status: "PENDING",
			grandTotal: 0,
		},
	});

	const editInvoiceForm = useForm<UpdateInvoiceForm>({
		resolver: zodResolver(updateInvoiceSchema),
		defaultValues: { status: "PENDING" },
	});

	const handleDueCollected = () => {
		queryClient.invalidateQueries({ queryKey: ["sale", id] });
	};

	const handleReturnProcessed = () => {
		queryClient.invalidateQueries({ queryKey: ["sale", id] });
	};

	if (isLoading) {
		let i = 0;
		return (
			<div className="container mx-auto p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 w-48 bg-muted rounded" />
					<div className="grid gap-4 md:grid-cols-5">
						{Array.from({ length: 5 }).map((_) => (
							<div key={i++} className="h-28 bg-muted rounded-lg" />
						))}
					</div>
					<div className="grid gap-6 md:grid-cols-3">
						<div className="h-96 bg-muted rounded-lg" />
						<div className="md:col-span-2 h-96 bg-muted rounded-lg" />
					</div>
				</div>
			</div>
		);
	}

	if (!sale) {
		return (
			<div className="container mx-auto p-6 text-center py-20">
				<p className="text-muted-foreground">Sale records not found.</p>
				<Button variant="ghost" className="mt-4" onClick={() => router.back()}>
					Go Back
				</Button>
			</div>
		);
	}

	const financials = calculateSaleFinancials(sale);
	const subtotal = financials.baseGrandTotal + Number(sale.discount ?? 0);
	const globalDiscount = Number(sale.discount ?? 0);
	const grandTotal = financials.adjustedGrandTotal;
	const totalPaid = financials.totalPaid;

	const totalProfit = financials.adjustedProfit;

	let structuredPayments: PaymentRecord[] = [];
	if (sale.payments) {
		try {
			structuredPayments =
				typeof sale.payments === "string"
					? JSON.parse(sale.payments)
					: (sale.payments as unknown as PaymentRecord[]);
		} catch (_e) {
			structuredPayments = [];
		}
	}

	const getDefaultInvoiceStatus = () => {
		if (Number(sale.due) <= 0) return "PAID";
		if ((sale.invoices ?? []).length > 0) return "PARTIALLY_PAID";
		return "PENDING";
	};

	const _openCreateInvoice = () => {
		createInvoiceForm.reset({
			billTo: sale.customer?.name ?? sale.customerNumber ?? "Walk-in Customer",
			invoiceDate: new Date().toISOString().slice(0, 10),
			saleId: id,
			status: getDefaultInvoiceStatus(),
			grandTotal: Number(sale.due),
		});
		setInvoiceOpen(true);
	};

	const onCreateInvoiceSubmit = (values: CreateInvoiceForm) => {
		createInvoice(
			{ ...values, invoiceDate: new Date(values.invoiceDate).toISOString() },
			{ onSuccess: () => setInvoiceOpen(false) },
		);
	};

	const onEditInvoiceSubmit = (values: UpdateInvoiceForm) => {
		if (!editingInvoice) return;
		updateInvoice(
			{ id: editingInvoice.id, ...values },
			{ onSuccess: () => setEditingInvoice(null) },
		);
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-2xl font-bold tracking-tight">
								Sale Details
							</h1>
							{Number(sale.due) === 0 ? (
								<Badge className="bg-green-100 text-green-800 border-green-200">
									Fully Paid
								</Badge>
							) : (
								<Badge className="bg-amber-100 text-amber-800 border-amber-200">
									Outstanding Balance
								</Badge>
							)}
						</div>
						<p className="text-xs font-mono text-muted-foreground mt-0.5">
							ID: {sale.id}
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => setIsReturnOpen(true)}
						className="gap-2 border-neutral-300 hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900"
					>
						<RotateCcw className="h-4 w-4" />
						Return Items
					</Button>
					{hasDue && (
						<Button
							variant="default"
							onClick={() => setDueTarget(sale)}
							className="gap-2 bg-primary hover:bg-primary/95"
						>
							<Wallet className="h-4 w-4" />
							Collect Due ({symbol}
							{Number(sale.due).toFixed(2)})
						</Button>
					)}
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
				<Card className="border shadow-sm">
					<CardContent className="pt-6 flex items-center gap-4">
						<div className="p-3 bg-primary/10 text-primary rounded-full">
							<ShoppingCart className="h-6 w-6" />
						</div>
						<div>
							<p className="text-xs font-medium text-muted-foreground">
								Grand Total
							</p>
							<p className="text-2xl font-bold">
								{symbol}
								{grandTotal.toFixed(2)}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border shadow-sm">
					<CardContent className="pt-6 flex items-center gap-4">
						<div className="p-3 bg-green-100 text-green-600 rounded-full">
							<DollarSign className="h-6 w-6" />
						</div>
						<div>
							<p className="text-xs font-medium text-muted-foreground">
								Total Paid
							</p>
							<p className="text-2xl font-bold text-green-600">
								{symbol}
								{totalPaid.toFixed(2)}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border shadow-sm">
					<CardContent className="pt-6 flex items-center gap-4">
						<div
							className={`p-3 rounded-full ${Number(sale.due) > 0 ? "bg-destructive/10 text-destructive" : "bg-green-100 text-green-600"}`}
						>
							<Receipt className="h-6 w-6" />
						</div>
						<div>
							<p className="text-xs font-medium text-muted-foreground">
								Due Remaining
							</p>
							<p
								className={`text-2xl font-bold ${Number(sale.due) > 0 ? "text-destructive" : "text-green-600"}`}
							>
								{symbol}
								{Number(sale.due).toFixed(2)}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border shadow-sm">
					<CardContent className="pt-6 flex items-center gap-4">
						<div className="p-3 bg-blue-100 text-blue-600 rounded-full">
							<FileText className="h-6 w-6" />
						</div>
						<div>
							<p className="text-xs font-medium text-muted-foreground">
								Associated Invoices
							</p>
							<p className="text-2xl font-bold">
								{(sale.invoices ?? []).length}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="border shadow-sm">
					<CardContent className="pt-6 flex items-center gap-4">
						<div
							className={`p-3 rounded-full ${totalProfit >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}
						>
							<TrendingUp className="h-6 w-6" />
						</div>
						<div>
							<p className="text-xs font-medium text-muted-foreground">
								Net Profit
							</p>
							<p
								className={`text-2xl font-bold ${totalProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}
							>
								{symbol}
								{totalProfit.toFixed(2)}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="space-y-6">
					<Card className="border shadow-sm">
						<CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
							<CardTitle className="text-sm font-semibold flex items-center gap-2">
								<User className="h-4 w-4 text-muted-foreground" />
								Customer
							</CardTitle>
							{sale.customerId && (
								<Link href={`/dashboard/customers/${sale.customerId}`}>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 gap-1.5 text-xs text-primary"
									>
										Profile <SquareArrowOutUpRight className="h-3 w-3" />
									</Button>
								</Link>
							)}
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							{sale.customer ? (
								<>
									<div className="flex justify-between items-center">
										<span className="text-muted-foreground">Name</span>
										<div className="flex items-center gap-1.5 font-medium">
											{sale.customer.name}
										</div>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Phone</span>
										<span className="font-medium">{sale.customer.phone}</span>
									</div>
									{sale.customer.email && (
										<div className="flex justify-between">
											<span className="text-muted-foreground">Email</span>
											<span
												className="font-medium truncate max-w-[180px]"
												title={sale.customer.email}
											>
												{sale.customer.email}
											</span>
										</div>
									)}
									{sale.customer.address && (
										<div className="flex justify-between">
											<span className="text-muted-foreground">Address</span>
											<span className="font-medium text-right text-xs max-w-[180px]">
												{sale.customer.address}
											</span>
										</div>
									)}
								</>
							) : (
								<div className="flex justify-between items-center py-1">
									<span className="text-muted-foreground">Identification</span>
									<span className="font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">
										{sale.customerNumber
											? `#${sale.customerNumber}`
											: "Walk-in Customer"}
									</span>
								</div>
							)}

							<div className="pt-3 border-t space-y-2.5 text-xs">
								<div className="flex justify-between">
									<span className="text-muted-foreground flex items-center gap-1">
										<Calendar className="h-3.5 w-3.5" /> Date
									</span>
									<span className="font-medium">
										{new Date(sale.createdAt).toLocaleString()}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground flex items-center gap-1">
										<CreditCard className="h-3.5 w-3.5" /> Payment Method
									</span>
									<span className="font-semibold uppercase tracking-wider text-primary text-[10px] bg-primary/10 px-2 py-0.5 rounded">
										{sale.paymentMethod.replace(/_/g, " ")}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="border shadow-sm">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-semibold flex items-center gap-2">
								<CreditCard className="h-4 w-4 text-muted-foreground" />
								Payment Breakdown
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{structuredPayments.length > 0 ? (
								<div className="space-y-2.5">
									{structuredPayments.map((p) => (
										<div
											key={p.amount}
											className="flex flex-col gap-1 p-2 bg-muted/40 rounded-lg text-xs border border-muted/50"
										>
											<div className="flex justify-between items-center">
												<span className="font-semibold uppercase tracking-tight text-foreground/80">
													{p.method.replace(/_/g, " ")}
												</span>
												<span className="font-bold text-sm">
													{symbol}
													{Number(p.amount).toFixed(2)}
												</span>
											</div>
											{p.transactionId && (
												<div className="text-[10px] text-muted-foreground flex items-center gap-1 border-t pt-1 mt-1">
													<span className="font-mono">
														TXN: {p.transactionId}
													</span>
												</div>
											)}
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-4 text-xs text-muted-foreground flex items-center justify-center gap-1.5 bg-muted/20 rounded-lg border border-dashed">
									<Info className="h-3.5 w-3.5" /> Single transaction record
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				<div className="lg:col-span-2 space-y-6">
					<Card className="border shadow-sm">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-semibold">
								Sale Items & Services
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							{sale.saleItems.length > 0 && (
								<div className="space-y-2">
									<div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
										<Package className="h-3.5 w-3.5" /> Products / Material
										batches
									</div>
									<div className="border rounded-lg overflow-hidden">
										<Table>
											<TableHeader className="bg-muted/40">
												<TableRow>
													<TableHead className="h-9">
														Item Description
													</TableHead>
													<TableHead className="h-9 text-right">Qty</TableHead>
													<TableHead className="h-9 text-right">
														Unit Price
													</TableHead>
													<TableHead className="h-9 text-right">Cost</TableHead>
													<TableHead className="h-9 text-right">
														Discount
													</TableHead>
													<TableHead className="h-9 text-right">
														Total
													</TableHead>
													<TableHead className="h-9 text-right">
														Profit
													</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{sale.saleItems.map((item) => {
													const lineTotal =
														Number(item.sellPrice) * item.quantity -
														Number(item.discount ?? 0);
													const isPrepared =
														item.itemType === "PREPARED_PRODUCT";
													const itemProfit = Number(item.profit ?? 0);

													return (
														<TableRow
															key={item.id}
															className="hover:bg-muted/10"
														>
															<TableCell className="py-2.5">
																<div className="flex flex-col">
																	<span className="font-medium text-sm text-foreground">
																		{item.product?.name ??
																			item.preparedProduct?.name ??
																			"—"}
																	</span>
																	<div className="flex items-center gap-1.5 mt-0.5">
																		{isPrepared ? (
																			<Badge className="h-4 px-1 text-[8px] bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200 uppercase font-mono">
																				<Layers className="h-2 w-2 mr-0.5" />{" "}
																				Prepared Batch
																			</Badge>
																		) : (
																			<Badge
																				variant="outline"
																				className="h-4 px-1 text-[8px] uppercase font-mono text-muted-foreground"
																			>
																				Standard Inventory
																			</Badge>
																		)}
																		{item.product?.sku && (
																			<span className="text-[10px] text-muted-foreground font-mono">
																				SKU: {item.product.sku}
																			</span>
																		)}
																	</div>
																</div>
															</TableCell>
															<TableCell className="py-2.5 text-right font-mono font-medium">
																{item.quantity}
															</TableCell>
															<TableCell className="py-2.5 text-right font-mono text-muted-foreground">
																{symbol}
																{Number(item.sellPrice).toFixed(2)}
															</TableCell>
															<TableCell className="py-2.5 text-right font-mono text-muted-foreground">
																{symbol}
																{Number(item.purchasePrice).toFixed(2)}
															</TableCell>
															<TableCell className="py-2.5 text-right font-mono text-destructive">
																{Number(item.discount) > 0
																	? `-${symbol}${Number(item.discount).toFixed(2)}`
																	: "—"}
															</TableCell>
															<TableCell className="py-2.5 text-right font-mono font-semibold text-foreground">
																{symbol}
																{lineTotal.toFixed(2)}
															</TableCell>
															<TableCell
																className={`py-2.5 text-right font-mono font-bold ${itemProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}
															>
																{itemProfit >= 0 ? "+" : ""}
																{symbol}
																{itemProfit.toFixed(2)}
															</TableCell>
														</TableRow>
													);
												})}
											</TableBody>
										</Table>
									</div>
								</div>
							)}

							{sale.saleServices.length > 0 && (
								<div className="space-y-2">
									<div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
										<CheckCircle className="h-3.5 w-3.5" /> Fulfilled Services
									</div>
									<div className="border rounded-lg overflow-hidden">
										<Table>
											<TableHeader className="bg-muted/40">
												<TableRow>
													<TableHead className="h-9">
														Service Description
													</TableHead>
													<TableHead className="h-9 text-right">Qty</TableHead>
													<TableHead className="h-9 text-right">
														Unit Price
													</TableHead>
													<TableHead className="h-9 text-right">Cost</TableHead>
													<TableHead className="h-9 text-right">
														Discount
													</TableHead>
													<TableHead className="h-9 text-right">
														Total
													</TableHead>
													<TableHead className="h-9 text-right">
														Profit
													</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{sale.saleServices.map((sv) => {
													const serviceProfit = Number(sv.profit ?? 0);
													const serviceCost =
														Number(sv.service?.internalCost ?? 0) * sv.quantity;

													return (
														<TableRow key={sv.id} className="hover:bg-muted/10">
															<TableCell className="py-2.5">
																<span className="font-medium text-sm text-foreground">
																	{sv.service?.name ?? "—"}
																</span>
															</TableCell>
															<TableCell className="py-2.5 text-right font-mono font-medium">
																{sv.quantity}
															</TableCell>
															<TableCell className="py-2.5 text-right font-mono text-muted-foreground">
																{symbol}
																{Number(sv.unitPrice).toFixed(2)}
															</TableCell>
															<TableCell className="py-2.5 text-right font-mono text-muted-foreground">
																{symbol}
																{serviceCost.toFixed(2)}
															</TableCell>
															<TableCell className="py-2.5 text-right font-mono text-destructive">
																{Number(sv.discount) > 0
																	? `-${symbol}${Number(sv.discount).toFixed(2)}`
																	: "—"}
															</TableCell>
															<TableCell className="py-2.5 text-right font-mono font-semibold text-foreground">
																{symbol}
																{Number(sv.total).toFixed(2)}
															</TableCell>
															<TableCell
																className={`py-2.5 text-right font-mono font-bold ${serviceProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}
															>
																{serviceProfit >= 0 ? "+" : ""}
																{symbol}
																{serviceProfit.toFixed(2)}
															</TableCell>
														</TableRow>
													);
												})}
											</TableBody>
										</Table>
									</div>
								</div>
							)}

							<div className="pt-4 border-t space-y-2 text-sm ml-auto max-w-sm">
								<div className="flex justify-between text-muted-foreground">
									<span>Items & Services Subtotal</span>
									<span className="font-mono">
										{symbol}
										{subtotal.toFixed(2)}
									</span>
								</div>
								{globalDiscount > 0 && (
									<div className="flex justify-between text-destructive">
										<span className="flex items-center gap-1">
											<BadgePercent className="h-4 w-4" /> Global Adjustment
											Discount
										</span>
										<span className="font-mono">
											-{symbol}
											{globalDiscount.toFixed(2)}
										</span>
									</div>
								)}
								<div className="flex justify-between items-center pt-2 border-t font-semibold text-base text-foreground">
									<span>Invoice Balance Due</span>
									<span className="font-mono text-lg font-bold">
										{symbol}
										{grandTotal.toFixed(2)}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{sale.customerReturns && sale.customerReturns.length > 0 && (
				<Card className="border shadow-sm">
					<CardHeader>
						<CardTitle className="text-sm font-semibold flex items-center gap-2">
							<RotateCcw className="h-4 w-4 text-muted-foreground" />
							Returned Items Audit Log
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Returned Item</TableHead>
									<TableHead>Type</TableHead>
									<TableHead className="text-right">Qty Returned</TableHead>
									<TableHead className="text-right">Amount Refunded</TableHead>
									<TableHead>Inventory Restocked</TableHead>
									<TableHead>Reason</TableHead>
									<TableHead>Date</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sale.customerReturns.map((ret) => {
									const name =
										ret.product?.name ?? ret.preparedProduct?.name ?? "—";
									return (
										<TableRow
											key={ret.id}
											className="hover:bg-muted/10 text-xs"
										>
											<TableCell className="font-medium">{name}</TableCell>
											<TableCell>
												<Badge
													variant="outline"
													className="text-[9px] font-semibold uppercase tracking-wider"
												>
													{ret.itemType}
												</Badge>
											</TableCell>
											<TableCell className="text-right font-mono font-semibold">
												{ret.quantity}
											</TableCell>
											<TableCell className="text-right font-mono font-bold text-red-600">
												-{symbol}
												{Number(ret.refundAmount).toFixed(2)}
											</TableCell>
											<TableCell>
												{ret.restocked ? (
													<span className="text-green-600 font-semibold">
														Yes
													</span>
												) : (
													<span className="text-neutral-400">No</span>
												)}
											</TableCell>
											<TableCell className="font-medium text-neutral-600">
												{ret.reason || "—"}
											</TableCell>
											<TableCell className="text-muted-foreground">
												{new Date(ret.createdAt).toLocaleDateString()}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}

			<Card className="border shadow-sm">
				<CardHeader className="flex flex-row items-center justify-between space-y-0">
					<CardTitle className="text-sm font-semibold flex items-center gap-2">
						<Receipt className="h-4 w-4 text-muted-foreground" />
						Invoices & Receipts Ledger
					</CardTitle>
				</CardHeader>
				<CardContent>
					{(sale.invoices ?? []).length === 0 ? (
						<div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
							<Receipt className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
							<p className="text-sm font-medium">
								No system invoices issued for this sale transaction.
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Invoice Identifier</TableHead>
									<TableHead>Recipient Billing</TableHead>
									<TableHead>Issuance Date</TableHead>
									<TableHead>Ledger Status</TableHead>
									<TableHead className="text-right">Billed Value</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{(sale.invoices ?? []).map((invoice) => (
									<TableRow key={invoice.id} className="hover:bg-muted/10">
										<TableCell className="font-mono text-xs text-primary font-medium">
											{invoice.id.slice(0, 13).toUpperCase()}...
										</TableCell>
										<TableCell className="font-medium text-foreground">
											{invoice.billTo}
										</TableCell>
										<TableCell>
											{new Date(invoice.invoiceDate).toLocaleDateString(
												undefined,
												{
													year: "numeric",
													month: "short",
													day: "numeric",
												},
											)}
										</TableCell>
										<TableCell>
											<Badge
												variant="outline"
												className={`text-[10px] font-semibold uppercase tracking-wider ${
													STATUS_STYLES[invoice.status] ?? ""
												}`}
											>
												{invoice.status.replace(/_/g, " ")}
											</Badge>
										</TableCell>
										<TableCell className="text-right font-mono font-semibold">
											{symbol}
											{Number(invoice.grandTotal).toFixed(2)}
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="outline"
												size="sm"
												onClick={() => setViewingInvoice(invoice)}
												className="h-8 text-xs"
											>
												View Invoice
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<Modal
				open={invoiceOpen}
				onOpenChange={(open) => !open && setInvoiceOpen(false)}
				title="Create System Invoice"
			>
				<form
					onSubmit={createInvoiceForm.handleSubmit(onCreateInvoiceSubmit)}
					className="space-y-4 p-4"
				>
					<Field>
						<FieldLabel htmlFor="billTo">Bill To recipient</FieldLabel>
						<Input id="billTo" {...createInvoiceForm.register("billTo")} />
						{createInvoiceForm.formState.errors.billTo && (
							<FieldError>
								{createInvoiceForm.formState.errors.billTo.message}
							</FieldError>
						)}
					</Field>

					<Field>
						<FieldLabel htmlFor="invoiceDate">Invoice Date</FieldLabel>
						<Input
							id="invoiceDate"
							type="date"
							{...createInvoiceForm.register("invoiceDate")}
						/>
					</Field>

					<Field>
						<FieldLabel htmlFor="grandTotal">
							Billed Amount ({symbol})
						</FieldLabel>
						<Input
							id="grandTotal"
							type="number"
							step="0.01"
							{...createInvoiceForm.register("grandTotal")}
						/>
						{createInvoiceForm.formState.errors.grandTotal && (
							<FieldError>
								{createInvoiceForm.formState.errors.grandTotal.message}
							</FieldError>
						)}
					</Field>
				</form>
			</Modal>

			<Modal
				open={!!editingInvoice}
				onOpenChange={(open) => !open && setEditingInvoice(null)}
				title="Modify Ledger Status"
			>
				<form
					onSubmit={editInvoiceForm.handleSubmit(onEditInvoiceSubmit)}
					className="space-y-4 p-4"
				>
					<div className="p-3 bg-muted rounded-md text-xs space-y-1.5 font-mono">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Invoice Reference</span>
							<span className="font-semibold">{editingInvoice?.id}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Outstanding Cost</span>
							<span className="font-semibold text-foreground">
								{symbol}
								{Number(editingInvoice?.grandTotal ?? 0).toFixed(2)}
							</span>
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-2">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setEditingInvoice(null)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isUpdatingInvoice}>
							{isUpdatingInvoice ? "Saving..." : "Update Status"}
						</Button>
					</div>
				</form>
			</Modal>

			<Modal
				open={!!viewingInvoice}
				onOpenChange={(open) => !open && setViewingInvoice(null)}
				title="Invoice Preview"
				className="max-w-4xl h-[95vh]"
			>
				{viewingInvoice && (
					<InvoiceViewer
						invoice={viewingInvoice}
						sale={sale}
						onClose={() => setViewingInvoice(null)}
					/>
				)}
			</Modal>

			<Modal
				open={!!dueTarget}
				onOpenChange={(open) => !open && setDueTarget(null)}
				title="Collect Due Payment"
			>
				{dueTarget && (
					<CollectDueModal
						sale={dueTarget}
						onClose={() => {
							setDueTarget(null);
							handleDueCollected();
						}}
					/>
				)}
			</Modal>

			<Modal
				open={isReturnOpen}
				onOpenChange={(open) => !open && setIsReturnOpen(false)}
				title="Issue Customer Return & Refund"
			>
				<ReturnItemsModal
					sale={sale}
					onClose={() => {
						setIsReturnOpen(false);
						handleReturnProcessed();
					}}
				/>
			</Modal>
		</div>
	);
}
