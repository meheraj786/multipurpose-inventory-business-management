"use client";

import {
	CalendarDays,
	CreditCard,
	Package,
	Tag,
	User,
	Wallet,
} from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/appComponents/Modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/hooks/useCurrency";
import { useGetPurchase, useGetPurchasePayments } from "@/hooks/usePurchases";
import type { PurchasePaymentStatus } from "@/lib/api/services/purchase.service";
import { RecordPaymentModal } from "../../../components/purchases/recordPaymentModal";

type Props = { purchaseId: string };

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
		<div className="flex items-start justify-between gap-4 py-2">
			<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-32 shrink-0">
				{label}
			</span>
			<span className="text-sm text-right">{value}</span>
		</div>
	);
}

export function PurchaseDetailModal({ purchaseId }: Props) {
	const { data: purchase, isLoading } = useGetPurchase(purchaseId);
	const { data: payments } = useGetPurchasePayments(purchaseId);
	const { symbol } = useCurrency();
	const [paymentOpen, setPaymentOpen] = useState(false);

	if (isLoading) {
		let i = 0;
		return (
			<div className="p-6 space-y-3">
				{Array.from({ length: 5 }).map((_) => (
					<div key={i++} className="h-8 bg-muted animate-pulse rounded" />
				))}
			</div>
		);
	}

	if (!purchase) {
		return (
			<div className="p-6 text-center text-muted-foreground text-sm">
				Purchase not found.
			</div>
		);
	}

	const stocks = purchase.productStocks ?? [];
	const due = Number(purchase.due);
	const paidAmount = Number(purchase.paidAmount);

	return (
		<div className="p-6 space-y-5">
			<div>
				<div className="flex items-center justify-between pb-2 border-b mb-3">
					<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
						Purchase Info
					</p>
					<Badge
						variant="outline"
						className={STATUS_STYLES[purchase.paymentStatus]}
					>
						{STATUS_LABELS[purchase.paymentStatus]}
					</Badge>
				</div>
				<DetailRow
					label="Purchase ID"
					value={
						<span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
							#{purchase.id.slice(0, 8).toUpperCase()}
						</span>
					}
				/>
				<DetailRow
					label="Date"
					value={
						<span className="flex items-center gap-1.5 justify-end">
							<CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
							{new Date(purchase.createdAt).toLocaleDateString("en-US", {
								year: "numeric",
								month: "short",
								day: "numeric",
							})}
						</span>
					}
				/>
				<DetailRow
					label="Supplier"
					value={
						purchase.supplier ? (
							<span className="flex items-center gap-1.5 justify-end">
								<User className="h-3.5 w-3.5 text-muted-foreground" />
								{purchase.supplier.name}
							</span>
						) : (
							<span className="text-muted-foreground">—</span>
						)
					}
				/>
				<DetailRow
					label="Total Cost"
					value={
						<span className="font-semibold text-base">
							{symbol}
							{Number(purchase.totalCost).toFixed(2)}
						</span>
					}
				/>
				<DetailRow
					label="Paid"
					value={
						<span className="text-emerald-600 font-medium">
							{symbol}
							{paidAmount.toFixed(2)}
						</span>
					}
				/>
				<DetailRow
					label="Due"
					value={
						<span
							className={
								due > 0
									? "text-destructive font-semibold"
									: "text-muted-foreground"
							}
						>
							{symbol}
							{due.toFixed(2)}
						</span>
					}
				/>
				{purchase.notes && (
					<DetailRow
						label="Notes"
						value={
							<span className="text-muted-foreground">{purchase.notes}</span>
						}
					/>
				)}
			</div>

			<Separator />

			<div>
				<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pb-2 border-b mb-3">
					Items ({stocks.length})
				</p>
				{stocks.length === 0 ? (
					<p className="text-sm text-muted-foreground text-center py-4">
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
										<p className="font-medium truncate">
											{s.product?.name ?? "Unknown"}
										</p>
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
			</div>

			<Separator />

			<div>
				<div className="flex items-center justify-between pb-2 border-b mb-3">
					<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
						Payments ({payments?.length ?? 0})
					</p>
					{due > 0 && (
						<Button size="sm" onClick={() => setPaymentOpen(true)}>
							<Wallet className="mr-2 h-3.5 w-3.5" />
							Record Payment
						</Button>
					)}
				</div>
				{!payments || payments.length === 0 ? (
					<p className="text-sm text-muted-foreground text-center py-4">
						No payments recorded yet.
					</p>
				) : (
					<div className="space-y-2">
						{payments.map((p) => (
							<div
								key={p.id}
								className="flex items-center justify-between rounded-md border px-3 py-2.5 text-sm"
							>
								<div className="flex items-center gap-2 min-w-0">
									<CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
									<div className="min-w-0">
										<p className="font-medium">
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
									{new Date(p.paidAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "short",
										day: "numeric",
									})}
								</span>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="flex justify-end pt-2 border-t">
				<div className="text-right">
					<p className="text-xs text-muted-foreground uppercase tracking-wider">
						Grand Total
					</p>
					<p className="text-xl font-bold tabular-nums">
						{symbol}
						{Number(purchase.totalCost).toFixed(2)}
					</p>
				</div>
			</div>

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
		</div>
	);
}
