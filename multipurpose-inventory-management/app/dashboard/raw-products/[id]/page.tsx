"use client";

import {
	ArrowLeft,
	Boxes,
	Package,
	PackagePlus,
	Tag,
	TrendingDown,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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
import { useGetSingleRawProduct } from "@/hooks/useRawProducts";

export default function RawProductDetailPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const { symbol } = useCurrency();

	const { data: rawProduct, isLoading } = useGetSingleRawProduct(id);

	if (isLoading) {
		let i = 0;
		return (
			<div className="container mx-auto p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 w-48 bg-muted rounded" />
					<div className="grid gap-4 md:grid-cols-4">
						{Array.from({ length: 4 }).map((_) => (
							<div key={i++} className="h-28 bg-muted rounded-lg" />
						))}
					</div>
				</div>
			</div>
		);
	}

	if (!rawProduct) {
		return (
			<div className="container mx-auto p-6 text-center py-20">
				<p className="text-muted-foreground">Raw product not found.</p>
				<Button variant="ghost" className="mt-4" onClick={() => router.back()}>
					Go Back
				</Button>
			</div>
		);
	}

	const currentStock =
		rawProduct.currentStock ?? Number(rawProduct.totalStock ?? 0);
	const alert = rawProduct.lowStockAlert
		? Number(rawProduct.lowStockAlert)
		: null;
	const isLow = alert !== null && currentStock > 0 && currentStock <= alert;
	const isOut = currentStock === 0;

	const totalCostInvested = (rawProduct.rawProductStocks ?? []).reduce(
		(sum, s) => sum + Number(s.totalCost ?? 0),
		0,
	);

	const usedInCount = (rawProduct.preparedProductItems ?? []).length;

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => router.back()}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-bold">{rawProduct.name}</h1>
						{isOut && (
							<Badge variant="destructive" className="text-xs">
								Out of Stock
							</Badge>
						)}
						{isLow && !isOut && (
							<Badge
								variant="outline"
								className="text-xs border-orange-400 text-orange-600"
							>
								Low Stock
							</Badge>
						)}
					</div>
					<p className="text-sm text-muted-foreground">
						{rawProduct.category?.name}
						{rawProduct.subCategory && ` › ${rawProduct.subCategory.name}`}
					</p>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardContent className="pt-6 flex items-center gap-4">
						<Package className="h-8 w-8 text-muted-foreground" />
						<div>
							<p className="text-xs text-muted-foreground">Current Stock</p>
							<p
								className={`text-2xl font-bold ${isOut ? "text-destructive" : isLow ? "text-orange-600" : ""}`}
							>
								{currentStock} {rawProduct.unit?.symbol}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6 flex items-center gap-4">
						<Tag className="h-8 w-8 text-muted-foreground" />
						<div>
							<p className="text-xs text-muted-foreground">Unit</p>
							<p className="text-2xl font-bold">{rawProduct.unit?.symbol}</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6 flex items-center gap-4">
						<TrendingDown className="h-8 w-8 text-muted-foreground" />
						<div>
							<p className="text-xs text-muted-foreground">Total Cost</p>
							<p className="text-2xl font-bold">
								{symbol}
								{totalCostInvested.toFixed(2)}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6 flex items-center gap-4">
						<Boxes className="h-8 w-8 text-muted-foreground" />
						<div>
							<p className="text-xs text-muted-foreground">Used In</p>
							<p className="text-2xl font-bold">{usedInCount} recipes</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Unit</span>
							<span className="font-medium">
								{rawProduct.unit?.name} ({rawProduct.unit?.symbol})
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Category</span>
							<span className="font-medium">{rawProduct.category?.name}</span>
						</div>
						{rawProduct.subCategory && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Subcategory</span>
								<span className="font-medium">
									{rawProduct.subCategory.name}
								</span>
							</div>
						)}
						{alert && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Low Stock Alert</span>
								<span className="font-medium">
									{alert} {rawProduct.unit?.symbol}
								</span>
							</div>
						)}
						<div className="flex justify-between">
							<span className="text-muted-foreground">Created</span>
							<span className="font-medium">
								{new Date(rawProduct.createdAt).toLocaleDateString()}
							</span>
						</div>
						{rawProduct.description && (
							<div className="pt-2 border-t">
								<p className="text-muted-foreground mb-1">Description</p>
								<p>{rawProduct.description}</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle className="text-base flex items-center gap-2">
							<PackagePlus className="h-4 w-4" />
							Stock History
						</CardTitle>
					</CardHeader>
					<CardContent>
						{(rawProduct.rawProductStocks ?? []).length === 0 ? (
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
										<TableHead className="text-right">Total Cost</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{(rawProduct.rawProductStocks ?? []).map((stock) => (
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
												{Number(stock.quantity)} {rawProduct.unit?.symbol}
											</TableCell>
											<TableCell className="text-right font-medium">
												{stock.totalCost != null
													? `${symbol}${Number(stock.totalCost).toFixed(2)}`
													: "—"}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>

			{(rawProduct.preparedProductItems ?? []).length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base flex items-center gap-2">
							<Boxes className="h-4 w-4" />
							Used In Recipes
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Prepared Product</TableHead>
									<TableHead className="text-right">Required Qty</TableHead>
									<TableHead className="text-right">Unit</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{(rawProduct.preparedProductItems ?? []).map((item) => (
									<TableRow
										key={item.id}
										className="cursor-pointer hover:bg-muted/50"
										onClick={() =>
											router.push(
												`/dashboard/prepared-products/${item.preparedProduct.id}`,
											)
										}
									>
										<TableCell className="font-medium">
											{item.preparedProduct.name}
										</TableCell>
										<TableCell className="text-right">
											{Number(item.quantity)}
										</TableCell>
										<TableCell className="text-right">{item.unit}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
