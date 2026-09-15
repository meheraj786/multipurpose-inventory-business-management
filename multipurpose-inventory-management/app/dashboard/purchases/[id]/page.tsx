"use client";

import {
	ArrowLeft,
	CalendarDays,
	CreditCard,
	Package,
	Pencil,
	Tag,
	User,
	Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/appComponents/Modal";
import { EditPurchaseModal } from "@/components/purchases/editPurchaseModal";
import { RecordPaymentModal } from "@/components/purchases/recordPaymentModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/hooks/useCurrency";
import { useGetPurchase, useGetPurchasePayments } from "@/hooks/usePurchases";
import type { PurchasePaymentStatus } from "@/lib/api/services/purchase.service";

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

function DetailRow({
	label,
	value,
}: {
	label: string;
	value: React.ReactNode;
}) {
	return (
		<div className="flex items-start justify-between gap-4 py-2.5 border-b last:border-0">
			<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-32 shrink-0">
				{label}
			</span>
			<span className="text-sm text-right">{value}</span>
		</div>
	);
}

export default function PurchaseDetailPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const { symbol } = useCurrency();
	const [paymentOpen, setPaymentOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);

	const { data: purchase, isLoading } = useGetPurchase(params.id);
	const { data: payments } = useGetPurchasePayments(params.id);

	if (isLoading) {
		return (
			<div className="container mx-auto p-6 space-y-4">
				<div className="h-8 w-40 bg-muted animate-pulse rounded" />
				<div className="h-64 bg-muted animate-pulse rounded-lg" />
			</div>
		);
	}

	if (!purchase) {
		return (
			<div className="container mx-auto p-6">
				<Button variant="ghost" onClick={() => router.back()}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back
				</Button>
				<p className="text-center text-muted-foreground py-12">
					Purchase not found.
				</p>
			</div>
		);
	}

	const stocks = purchase.productStocks ?? [];
	const due = Number(purchase.due);
	const paidAmount = Number(purchase.paidAmount);
	const totalCost = Number(purchase.totalCost);

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
							Purchase{" "}
							<span className="font-mono text-lg text-muted-foreground">
								#{purchase.id.slice(0, 8).toUpperCase()}
							</span>
						</h1>
						<p className="text-sm text-muted-foreground">
							{new Date(purchase.createdAt).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Badge
						variant="outline"
						className={STATUS_STYLES[purchase.paymentStatus]}
					>
						{STATUS_LABELS[purchase.paymentStatus]}
					</Badge>
					<Button variant="outline" onClick={() => setEditOpen(true)}>
						<Pencil className="mr-2 h-4 w-4" />
						Edit
					</Button>
					{due > 0 && (
						<Button onClick={() => setPaymentOpen(true)}>
							<Wallet className="mr-2 h-4 w-4" />
							Make Payment
						</Button>
					)}
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Total Cost
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold tabular-nums">
							{symbol}
							{totalCost.toFixed(2)}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Paid
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold tabular-nums text-emerald-600">
							{symbol}
							{paidAmount.toFixed(2)}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Due
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p
							className={`text-2xl font-bold tabular-nums ${
								due > 0 ? "text-destructive" : "text-muted-foreground"
							}`}
						>
							{symbol}
							{due.toFixed(2)}
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<Card className="lg:col-span-1">
					<CardHeader>
						<CardTitle className="text-base">Purchase Info</CardTitle>
					</CardHeader>
					<CardContent>
						<DetailRow
							label="Supplier"
							value={
								purchase.supplier ? (
									<Link
										href={`/dashboard/suppliers/${purchase.supplier.id}`}
										className="flex items-center gap-1.5 justify-end hover:underline"
									>
										<User className="h-3.5 w-3.5 text-muted-foreground" />
										{purchase.supplier.name}
									</Link>
								) : (
									<span className="text-muted-foreground">—</span>
								)
							}
						/>
						<DetailRow
							label="Created"
							value={
								<span className="flex items-center gap-1.5 justify-end">
									<CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
									{new Date(purchase.createdAt).toLocaleString("en-US")}
								</span>
							}
						/>
						<DetailRow
							label="Last Updated"
							value={new Date(purchase.updatedAt).toLocaleString("en-US")}
						/>
						{purchase.notes && (
							<DetailRow
								label="Notes"
								value={
									<span className="text-muted-foreground">
										{purchase.notes}
									</span>
								}
							/>
						)}
					</CardContent>
				</Card>

				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="text-base">Items ({stocks.length})</CardTitle>
					</CardHeader>
					<CardContent>
						{stocks.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-6">
								No items found.
							</p>
						) : (
							<div className="space-y-2">
								{stocks.map((s) => (
									<div
										key={s.id}
										className="flex items-center justify-between rounded-md border px-3 py-2.5 text-sm"
									>
										<div className="flex items-center gap-2 min-w-0">
											<Package className="h-4 w-4 text-muted-foreground shrink-0" />
											<div className="min-w-0">
												<Link
													href={`/dashboard/products/${s.product?.id}`}
													className="font-medium truncate hover:underline"
												>
													{s.product?.name ?? "Unknown"}
												</Link>
												{s.batch && (
													<p className="text-xs text-muted-foreground flex items-center gap-1">
														<Tag className="h-3 w-3" />
														Batch: {s.batch}
													</p>
												)}
											</div>
										</div>
										<div className="flex items-center gap-3 shrink-0 ml-4">
											<Badge variant="secondary" className="tabular-nums">
												{Number(s.quantity).toFixed(2)} {s.unit?.symbol ?? ""}
											</Badge>
											<span className="text-muted-foreground text-xs tabular-nums">
												{symbol}
												{Number(s.purchasePrice).toFixed(2)} / unit
											</span>
											<span className="font-semibold tabular-nums">
												{symbol}
												{Number(s.totalCost).toFixed(2)}
											</span>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="text-base">
							Payment History ({payments?.length ?? 0})
						</CardTitle>
						{due > 0 && (
							<Button size="sm" onClick={() => setPaymentOpen(true)}>
								<Wallet className="mr-2 h-3.5 w-3.5" />
								Make Payment
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{!payments || payments.length === 0 ? (
						<p className="text-sm text-muted-foreground text-center py-6">
							No payments recorded yet.
						</p>
					) : (
						<div className="space-y-2">
							{payments.map((p) => (
								<div
									key={p.id}
									className="flex items-center justify-between rounded-md border px-3 py-2.5 text-sm"
								>
									<div className="flex items-center gap-3 min-w-0">
										<div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
											<CreditCard className="h-4 w-4 text-emerald-600" />
										</div>
										<div className="min-w-0">
											<p className="font-medium tabular-nums">
												{symbol}
												{Number(p.amount).toFixed(2)}
											</p>
											<p className="text-xs text-muted-foreground">
												{p.method.replaceAll("_", " ")}
												{p.note ? ` · ${p.note}` : ""}
											</p>
										</div>
									</div>
									<span className="text-xs text-muted-foreground whitespace-nowrap">
										{new Date(p.paidAt).toLocaleString("en-US", {
											year: "numeric",
											month: "short",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
							))}
						</div>
					)}
					<Separator className="my-4" />
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Total Paid</span>
						<span className="font-semibold tabular-nums">
							{symbol}
							{paidAmount.toFixed(2)}
						</span>
					</div>
				</CardContent>
			</Card>

			<Modal
				open={paymentOpen}
				onOpenChange={setPaymentOpen}
				title="Record Payment"
			>
				<RecordPaymentModal
					purchase={purchase}
					onClose={() => setPaymentOpen(false)}
				/>
			</Modal>

			<Modal open={editOpen} onOpenChange={setEditOpen} title="Edit Purchase">
				<EditPurchaseModal
					purchase={purchase}
					onClose={() => setEditOpen(false)}
				/>
			</Modal>
		</div>
	);
}
