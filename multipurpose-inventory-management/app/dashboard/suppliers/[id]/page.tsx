"use client";

import {
	ArrowLeft,
	Building2,
	Mail,
	MapPin,
	Package,
	Pencil,
	Phone,
	Power,
	ShoppingCart,
	Trash2,
	Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/appComponents/Modal";
import { MetricCard } from "@/components/appComponents/metric-card";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/hooks/useCurrency";
import {
	useDeleteSupplier,
	useGetSupplier,
	useToggleSupplierActive,
} from "@/hooks/useSuppliers";
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

export default function SupplierDetailPage() {
	const params = useParams();
	const router = useRouter();
	const id = params?.id as string;

	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const { symbol } = useCurrency();

	const { data: supplier, isLoading } = useGetSupplier(id);
	const { mutate: toggleActive, isPending: toggling } =
		useToggleSupplierActive();
	const { mutate: deleteSupplier, isPending: isDeleting } = useDeleteSupplier();

	if (isLoading) {
		return (
			<div className="container mx-auto p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 w-48 bg-muted rounded" />
					<div className="h-32 bg-muted rounded" />
				</div>
			</div>
		);
	}

	if (!supplier) {
		return (
			<div className="container mx-auto p-6 text-center">
				<p className="text-muted-foreground">Supplier not found.</p>
				<Button variant="ghost" className="mt-4" onClick={() => router.back()}>
					Go back
				</Button>
			</div>
		);
	}

	const totalPurchaseValue = Number(supplier.totalPurchaseValue ?? 0);
	const totalPaid = Number(supplier.totalPaid ?? 0);
	const totalDue = Number(supplier.totalDue ?? 0);
	const purchases = supplier.purchases ?? [];
	const productStocks = supplier.productStocks ?? [];

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold">{supplier.name}</h1>
						{supplier.companyName && (
							<p className="text-muted-foreground text-sm">
								{supplier.companyName}
							</p>
						)}
					</div>
					{supplier.isActive ? (
						<Badge className="bg-green-100 text-green-700 hover:bg-green-100">
							Active
						</Badge>
					) : (
						<Badge variant="secondary">Inactive</Badge>
					)}
					{totalDue > 0 && (
						<Badge variant="outline" className={STATUS_STYLES.PARTIALLY_PAID}>
							{symbol}
							{totalDue.toFixed(2)} Due
						</Badge>
					)}
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={toggling}
						onClick={() => toggleActive(supplier.id)}
					>
						<Power className="mr-2 h-4 w-4" />
						{supplier.isActive ? "Deactivate" : "Activate"}
					</Button>

					<Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
						<Pencil className="mr-2 h-4 w-4" />
						Edit
					</Button>

					<Button
						variant="destructive"
						size="sm"
						onClick={() => setDeleteOpen(true)}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
					</Button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
				<MetricCard
					title="Total Purchases"
					value={purchases.length.toString()}
					icon={ShoppingCart}
				/>
				<MetricCard
					title="Total Purchase Value"
					value={`${symbol}${totalPurchaseValue.toFixed(2)}`}
					icon={ShoppingCart}
				/>
				<MetricCard
					title="Total Paid"
					value={`${symbol}${totalPaid.toFixed(2)}`}
					icon={Wallet}
				/>
				<MetricCard
					title="Total Due"
					value={`${symbol}${totalDue.toFixed(2)}`}
					icon={Wallet}
					className={STATUS_STYLES[totalDue > 0 ? "PARTIALLY_PAID" : "PAID"]}
				/>
				<MetricCard
					title="Stock Entries"
					value={(supplier._count?.productStocks ?? 0).toString()}
					icon={Package}
				/>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Contact Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex items-center gap-2 text-sm">
							<Phone className="h-4 w-4 text-muted-foreground" />
							{supplier.contact}
						</div>
						{supplier.email && (
							<div className="flex items-center gap-2 text-sm">
								<Mail className="h-4 w-4 text-muted-foreground" />
								{supplier.email}
							</div>
						)}
						{supplier.companyName && (
							<div className="flex items-center gap-2 text-sm">
								<Building2 className="h-4 w-4 text-muted-foreground" />
								{supplier.companyName}
							</div>
						)}
						{supplier.address && (
							<div className="flex items-center gap-2 text-sm">
								<MapPin className="h-4 w-4 text-muted-foreground" />
								{supplier.address}
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">Recent Stock Entries</CardTitle>
					</CardHeader>
					<CardContent>
						{productStocks.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No stock entries yet.
							</p>
						) : (
							<ul className="space-y-2">
								{productStocks.slice(0, 5).map((ps) => (
									<li key={ps.id} className="flex justify-between text-sm">
										<span>{ps.product?.name ?? "—"}</span>
										<span className="text-muted-foreground">
											{Number(ps.quantity).toFixed(2)} {ps.unit?.symbol} @{" "}
											{symbol}
											{Number(ps.purchasePrice).toFixed(2)}
										</span>
									</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Purchase History</CardTitle>
				</CardHeader>
				<CardContent>
					{purchases.length === 0 ? (
						<p className="text-sm text-muted-foreground">No purchases yet.</p>
					) : (
						<ul className="space-y-3">
							{purchases.map((p, i) => (
								<li key={p.id}>
									<div className="flex items-center justify-between">
										<div>
											<Link
												href={`/dashboard/purchases/${p.id}`}
												className="text-sm font-medium font-mono hover:underline"
											>
												#{p.id.slice(0, 8).toUpperCase()}
											</Link>
											<p className="text-xs text-muted-foreground">
												{new Date(p.createdAt).toLocaleString()}
											</p>
										</div>
										<div className="flex items-center gap-2">
											<Badge
												variant="outline"
												className={STATUS_STYLES[p.paymentStatus]}
											>
												{STATUS_LABELS[p.paymentStatus]}
											</Badge>
											<div className="text-right">
												<p className="text-sm font-semibold">
													{symbol}
													{Number(p.totalCost).toFixed(2)}
												</p>
												{Number(p.due) > 0 && (
													<p className="text-xs text-destructive">
														{symbol}
														{Number(p.due).toFixed(2)} due
													</p>
												)}
											</div>
										</div>
									</div>

									{p.productStocks?.length ? (
										<ul className="mt-1.5 ml-4 space-y-1">
											{p.productStocks.map((ps) => (
												<li
													key={ps.id}
													className="text-xs text-muted-foreground"
												>
													{ps.product?.name} — {Number(ps.quantity).toFixed(2)}{" "}
													{ps.unit?.symbol} @ {symbol}
													{Number(ps.purchasePrice).toFixed(2)}
												</li>
											))}
										</ul>
									) : null}

									{i < purchases.length - 1 && <Separator className="mt-3" />}
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>

			<Modal open={editOpen} onOpenChange={setEditOpen} title="Edit Supplier">
				<SupplierFormModal
					supplier={supplier}
					onClose={() => setEditOpen(false)}
				/>
			</Modal>

			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete supplier?</AlertDialogTitle>
						<AlertDialogDescription>
							&quot;{supplier.name}&quot; will be moved to trash. You can
							restore it later.
							{totalDue > 0 && (
								<span className="block mt-2 text-destructive font-medium">
									This supplier has {symbol}
									{totalDue.toFixed(2)} in outstanding due.
								</span>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={() =>
								deleteSupplier(supplier.id, {
									onSuccess: () => router.push("/dashboard/suppliers"),
								})
							}
						>
							{isDeleting ? "Deleting..." : "Move to Trash"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
