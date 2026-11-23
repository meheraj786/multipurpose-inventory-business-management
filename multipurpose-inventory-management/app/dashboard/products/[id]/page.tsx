"use client";

import {
	ArrowLeft,
	BarChart3,
	DollarSign,
	Package,
	Receipt,
	Tag,
	TrendingUp,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/appComponents/Modal";
import { CreatePurchaseModal } from "@/components/purchases/createPurchaseModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useCurrency } from "@/hooks/useCurrency";
import { useGetSingleProduct } from "@/hooks/useProducts";

export default function ProductDetailPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const [purchaseOpen, setPurchaseOpen] = useState(false);
	const { symbol } = useCurrency();

	const { data: product, isLoading } = useGetSingleProduct(id);

	if (isLoading) {
		return (
			<div className="container mx-auto p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 w-48 bg-muted rounded" />
					<div className="grid gap-4 md:grid-cols-4">
						{Array.from({ length: 4 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
							<div key={i} className="h-28 bg-muted rounded-lg" />
						))}
					</div>
					<div className="grid gap-6 md:grid-cols-3">
						<div className="h-64 bg-muted rounded-lg" />
						<div className="col-span-2 h-64 bg-muted rounded-lg" />
					</div>
				</div>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="container mx-auto p-6 text-center py-20">
				<p className="text-muted-foreground">Product not found.</p>
				<Button variant="ghost" className="mt-4" onClick={() => router.back()}>
					Go Back
				</Button>
			</div>
		);
	}

	const totalStock = product.totalStock ?? 0;
	const stockValue = totalStock * Number(product.defaultSalePrice ?? 0);
	const margin =
		product.defaultPurchasePrice && product.defaultSalePrice
			? (
					((product.defaultSalePrice - product.defaultPurchasePrice) /
						product.defaultSalePrice) *
					100
				).toFixed(1)
			: null;
	const isLowStock =
		product.lowStockAlert !== null &&
		product.lowStockAlert !== undefined &&
		totalStock <= Number(product.lowStockAlert);

	const totalSold = (product.saleItems ?? []).reduce(
		(sum, s) => sum + s.quantity,
		0,
	);

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-2xl font-bold">{product.name}</h1>
							{product.sku && (
								<Badge variant="outline" className="font-mono text-xs">
									{product.sku}
								</Badge>
							)}
							{isLowStock && (
								<Badge variant="destructive" className="text-xs">
									Low Stock
								</Badge>
							)}
						</div>
						<p className="text-sm text-muted-foreground">
							{product.category?.name}
							{product.subCategory && ` › ${product.subCategory.name}`}
						</p>
					</div>
				</div>
				<Button onClick={() => setPurchaseOpen(true)}>
					<Package className="mr-2 h-4 w-4" />
					Purchase
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardContent className="pt-6 flex items-center gap-4">
						<Package className="h-8 w-8 text-muted-foreground" />
						<div>
							<p className="text-xs text-muted-foreground">Total Stock</p>
							<p
								className={`text-2xl font-bold ${isLowStock ? "text-destructive" : ""}`}
							>
								{totalStock}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6 flex items-center gap-4">
						<DollarSign className="h-8 w-8 text-muted-foreground" />
						<div>
							<p className="text-xs text-muted-foreground">Sale Price</p>
							<p className="text-2xl font-bold">
								{symbol}
								{Number(product.defaultSalePrice ?? 0).toFixed(2)}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6 flex items-center gap-4">
						<TrendingUp className="h-8 w-8 text-muted-foreground" />
						<div>
							<p className="text-xs text-muted-foreground">Stock Value</p>
							<p className="text-2xl font-bold">
								{symbol}
								{stockValue.toFixed(2)}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6 flex items-center gap-4">
						<BarChart3 className="h-8 w-8 text-muted-foreground" />
						<div>
							<p className="text-xs text-muted-foreground">Total Sold</p>
							<p className="text-2xl font-bold">{totalSold}</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="text-base flex items-center gap-2">
							<Tag className="h-4 w-4" />
							Product Info
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Purchase Price</span>
							<span className="font-medium">
								{symbol}
								{Number(product.defaultPurchasePrice ?? 0).toFixed(2)}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Sale Price</span>
							<span className="font-medium">
								{symbol}
								{Number(product.defaultSalePrice ?? 0).toFixed(2)}
							</span>
						</div>
						{margin && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Margin</span>
								<span className="font-medium text-green-600">{margin}%</span>
							</div>
						)}
						{product.tax != null && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Tax</span>
								<span className="font-medium">{product.tax}%</span>
							</div>
						)}
						{product.lowStockAlert && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Low Stock Alert</span>
								<span className="font-medium">
									{product.lowStockAlert} units
								</span>
							</div>
						)}
						<div className="flex justify-between">
							<span className="text-muted-foreground">Category</span>
							<span className="font-medium">{product.category?.name}</span>
						</div>
						{product.subCategory && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Subcategory</span>
								<span className="font-medium">{product.subCategory.name}</span>
							</div>
						)}
						<div className="flex justify-between">
							<span className="text-muted-foreground">Created</span>
							<span className="font-medium">
								{new Date(product.createdAt).toLocaleDateString()}
							</span>
						</div>
						{product.description && (
							<div className="pt-2 border-t">
								<p className="text-muted-foreground mb-1">Description</p>
								<p>{product.description}</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle className="text-base flex items-center gap-2">
							<Package className="h-4 w-4" />
							Stock History
						</CardTitle>
					</CardHeader>
					<CardContent>
						{(product.productStocks ?? []).length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
								<Package className="h-8 w-8" />
								<p className="text-sm">No stock entries yet</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Supplier</TableHead>
										<TableHead>Batch</TableHead>
										<TableHead className="text-right">Qty</TableHead>
										<TableHead className="text-right">Purchase Price</TableHead>
										<TableHead className="text-right">Total Cost</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{(product.productStocks ?? []).map((stock) => (
										<TableRow key={stock.id}>
											<TableCell>
												{new Date(stock.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell>
												{stock.supplier?.name ?? (
													<span className="text-muted-foreground">—</span>
												)}
											</TableCell>
											<TableCell>
												{stock.batch ?? (
													<span className="text-muted-foreground">—</span>
												)}
											</TableCell>
											<TableCell className="text-right">
												{stock.quantity}
											</TableCell>
											<TableCell className="text-right">
												{symbol}
												{Number(stock.purchasePrice).toFixed(2)}
											</TableCell>
											<TableCell className="text-right font-medium">
												{symbol}
												{Number(stock.totalCost).toFixed(2)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Receipt className="h-4 w-4" />
						Sales History
					</CardTitle>
				</CardHeader>
				<CardContent>
					{(product.saleItems ?? []).length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
							<Receipt className="h-8 w-8" />
							<p className="text-sm">No sales recorded yet</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Customer</TableHead>
									<TableHead>Payment</TableHead>
									<TableHead className="text-right">Qty</TableHead>
									<TableHead className="text-right">Sell Price</TableHead>
									<TableHead className="text-right">Discount</TableHead>
									<TableHead className="text-right">Total</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{(product.saleItems ?? []).map((item) => {
									const lineTotal =
										Number(item.sellPrice) * item.quantity -
										Number(item.discount ?? 0);
									return (
										<TableRow
											onClick={() =>
												router.push(`/dashboard/sales/${item.sale.id}`)
											}
											key={item.id}
											className="cursor-pointer"
										>
											<TableCell>
												{new Date(item.sale.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell>
												{item.sale.customer ? (
													<div>
														<p className="font-medium">
															{item.sale.customer.name}
														</p>
														<p className="text-xs text-muted-foreground">
															{item.sale.customer.phone}
														</p>
													</div>
												) : (
													<span className="text-muted-foreground">Walk-in</span>
												)}
											</TableCell>
											<TableCell>
												<Badge variant="outline" className="text-xs">
													{item.sale.paymentMethod.replace("_", " ")}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												{item.quantity}
											</TableCell>
											<TableCell className="text-right">
												{symbol}
												{Number(item.sellPrice).toFixed(2)}
											</TableCell>
											<TableCell className="text-right">
												{symbol}
												{Number(item.discount ?? 0).toFixed(2)}
											</TableCell>
											<TableCell className="text-right font-medium">
												{symbol}
												{lineTotal.toFixed(2)}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<Modal
				open={purchaseOpen}
				onOpenChange={(open) => !open && setPurchaseOpen(false)}
				title="Create Purchase"
			>
				<CreatePurchaseModal
					initialProductId={id}
					onClose={() => setPurchaseOpen(false)}
				/>
			</Modal>
		</div>
	);
}
