"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	ArrowLeft,
	Boxes,
	DollarSign,
	Package,
	TrendingUp,
	Zap,
} from "lucide-react";
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
import {
	useGetSinglePreparedProduct,
	useProduceStock,
} from "@/hooks/usePreparedProducts";
import type {
	PreparedProduct,
	PreparedProductItem,
	PreparedProductStock,
} from "@/lib/api/services/preparedProduct.service";
import {
	type ProduceStockForm,
	produceStockSchema,
} from "@/validation/preparedProduct.schema";

interface PreparedProductDetail extends PreparedProduct {
	preparedProductItems: PreparedProductItem[];
	preparedProductStocks?: PreparedProductStock[];
	createdAt: string;
}

export default function PreparedProductDetailPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const [produceOpen, setProduceOpen] = useState(false);

	const { data: pp, isLoading } = useGetSinglePreparedProduct(id);
	const { mutate: produceStock, isPending: isProducing } = useProduceStock(id);

	const produceForm = useForm<ProduceStockForm>({
		resolver: zodResolver(produceStockSchema),
		defaultValues: { quantity: 1 },
	});

	const onProduceSubmit = (values: ProduceStockForm) => {
		produceStock(values.quantity, {
			onSuccess: () => {
				produceForm.reset();
				setProduceOpen(false);
			},
		});
	};

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

	if (!pp) {
		return (
			<div className="container mx-auto p-6 text-center py-20">
				<p className="text-muted-foreground">Prepared product not found.</p>
				<Button variant="ghost" className="mt-4" onClick={() => router.back()}>
					Go Back
				</Button>
			</div>
		);
	}

	const detail = pp as PreparedProductDetail;

	const totalStock = detail.totalStock ?? 0;
	const stockValue = totalStock * Number(detail.defaultSalePrice ?? 0);
	const margin =
		detail.rawMaterialCost && detail.defaultSalePrice
			? (
					((detail.defaultSalePrice - detail.rawMaterialCost) /
						detail.defaultSalePrice) *
					100
				).toFixed(1)
			: null;

	const canProduce = detail.preparedProductItems.every(
		(item) => Number(item.rawProduct.totalStock) >= Number(item.quantity),
	);

	const maxProducible =
		detail.preparedProductItems.length > 0
			? Math.min(
					...detail.preparedProductItems.map((item) =>
						Math.floor(
							Number(item.rawProduct.totalStock) / Number(item.quantity),
						),
					),
				)
			: 0;

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-2xl font-bold">{detail.name}</h1>
							<Badge variant="outline" className="font-mono text-xs">
								{detail.unit?.symbol}
							</Badge>
							{!canProduce && (
								<Badge variant="destructive" className="text-xs">
									Insufficient Raw Materials
								</Badge>
							)}
						</div>
						<p className="text-sm text-muted-foreground">
							Prepared Product · Created{" "}
							{new Date(detail.createdAt).toLocaleDateString()}
						</p>
					</div>
				</div>
				<Button
					onClick={() => setProduceOpen(true)}
					disabled={!canProduce}
					title={!canProduce ? "Insufficient raw materials" : undefined}
				>
					<Zap className="mr-2 h-4 w-4" />
					Produce Stock
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardContent className="pt-6 flex items-center gap-4">
						<Package className="h-8 w-8 text-muted-foreground" />
						<div>
							<p className="text-xs text-muted-foreground">Current Stock</p>
							<p className="text-2xl font-bold">
								{totalStock} {detail.unit?.symbol}
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
								${Number(detail.defaultSalePrice ?? 0).toFixed(2)}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6 flex items-center gap-4">
						<TrendingUp className="h-8 w-8 text-muted-foreground" />
						<div>
							<p className="text-xs text-muted-foreground">Stock Value</p>
							<p className="text-2xl font-bold">${stockValue.toFixed(2)}</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6 flex items-center gap-4">
						<Zap className="h-8 w-8 text-muted-foreground" />
						<div>
							<p className="text-xs text-muted-foreground">Max Producible</p>
							<p className="text-2xl font-bold">
								{maxProducible} {detail.unit?.symbol}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Product Info</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Material Cost</span>
							<span className="font-medium">
								${Number(detail.rawMaterialCost ?? 0).toFixed(2)}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Sale Price</span>
							<span className="font-medium">
								${Number(detail.defaultSalePrice ?? 0).toFixed(2)}
							</span>
						</div>
						{margin && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Margin</span>
								<span className="font-medium text-green-600">{margin}%</span>
							</div>
						)}
						{detail.expiryDate && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Expiry Date</span>
								<span className="font-medium">
									{new Date(detail.expiryDate).toLocaleDateString()}
								</span>
							</div>
						)}
						{detail.description && (
							<div className="pt-2 border-t">
								<p className="text-muted-foreground mb-1">Description</p>
								<p>{detail.description}</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle className="text-base flex items-center gap-2">
							<Boxes className="h-4 w-4" />
							Recipe / Ingredients
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Raw Material</TableHead>
									<TableHead className="text-right">
										Required Per Unit
									</TableHead>
									<TableHead className="text-right">Available Stock</TableHead>
									<TableHead className="text-right">Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{detail.preparedProductItems.map((item) => {
									const available = Number(item.rawProduct.totalStock);
									const required = Number(item.quantity);
									const sufficient = available >= required;
									return (
										<TableRow key={item.id}>
											<TableCell
												className="font-medium cursor-pointer hover:underline"
												onClick={() =>
													router.push(
														`/dashboard/raw-products/${item.rawProductId}`,
													)
												}
											>
												{item.rawProduct.name}
											</TableCell>
											<TableCell className="text-right">
												{required} {item.unit}
											</TableCell>
											<TableCell className="text-right">
												{available} {item.rawProduct.unit?.symbol}
											</TableCell>
											<TableCell className="text-right">
												<Badge
													variant="outline"
													className={
														sufficient
															? "border-green-500 text-green-700"
															: "border-destructive text-destructive"
													}
												>
													{sufficient ? "Sufficient" : "Insufficient"}
												</Badge>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Package className="h-4 w-4" />
						Production History
					</CardTitle>
				</CardHeader>
				<CardContent>
					{(detail.preparedProductStocks ?? []).length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
							<Zap className="h-8 w-8" />
							<p className="text-sm">No production runs yet</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead className="text-right">
										Quantity Produced
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{(detail.preparedProductStocks ?? []).map((stock) => (
									<TableRow key={stock.id}>
										<TableCell>
											{new Date(stock.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell className="text-right font-medium">
											{Number(stock.quantity)} {detail.unit?.symbol}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<Modal
				open={produceOpen}
				onOpenChange={(open) => !open && setProduceOpen(false)}
				title="Produce Stock"
			>
				<form
					onSubmit={produceForm.handleSubmit(onProduceSubmit)}
					className="space-y-5 p-6"
				>
					<div className="p-3 bg-muted/30 rounded-md text-sm space-y-2">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Current Stock</span>
							<span className="font-medium">
								{totalStock} {detail.unit?.symbol}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Max Producible</span>
							<span className="font-medium text-green-600">
								{maxProducible} {detail.unit?.symbol}
							</span>
						</div>
					</div>

					<div className="space-y-2">
						<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
							Will Consume Per Unit
						</p>
						{detail.preparedProductItems.map((item) => (
							<div
								key={item.id}
								className="flex justify-between text-sm px-2 py-1 rounded bg-muted/30"
							>
								<span>{item.rawProduct.name}</span>
								<span className="text-muted-foreground">
									{Number(item.quantity)} {item.unit}
								</span>
							</div>
						))}
					</div>

					<Field>
						<FieldLabel htmlFor="quantity">
							Quantity to Produce ({detail.unit?.symbol})
						</FieldLabel>
						<Input
							id="quantity"
							type="number"
							step="0.01"
							min={0.01}
							max={maxProducible}
							{...produceForm.register("quantity")}
						/>
						{produceForm.formState.errors.quantity && (
							<FieldError>
								{produceForm.formState.errors.quantity.message}
							</FieldError>
						)}
					</Field>

					<div className="flex justify-end gap-3 pt-2">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setProduceOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isProducing}>
							{isProducing ? "Producing..." : "Produce"}
						</Button>
					</div>
				</form>
			</Modal>
		</div>
	);
}
