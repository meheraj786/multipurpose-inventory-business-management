"use client";

import {
	ArrowLeft,
	DollarSign,
	Layers,
	Receipt,
	ShoppingCart,
	Tag,
	TrendingUp,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { MetricCard } from "@/components/appComponents/metric-card";
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
import { useGetSingleService } from "@/hooks/useService";
import type { SaleService } from "@/lib/api/services/service.service";

export default function ServiceDetailPage() {
	const { id } = useParams<{ id: string }>();
	const { symbol } = useCurrency();
	const router = useRouter();

	const { data: service, isLoading } = useGetSingleService(id);

	if (isLoading) {
		return (
			<div className="container mx-auto p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 w-48 bg-muted rounded" />
					<div className="grid gap-4 md:grid-cols-4">
						{["sk1", "sk2", "sk3", "sk4"].map((key) => (
							<div key={key} className="h-28 bg-muted rounded-lg" />
						))}
					</div>
					<div className="h-64 bg-muted rounded-lg" />
				</div>
			</div>
		);
	}

	if (!service) {
		return (
			<div className="container mx-auto p-6 text-center">
				<p className="text-muted-foreground">Service not found.</p>
				<Button variant="ghost" className="mt-4" onClick={() => router.back()}>
					Go Back
				</Button>
			</div>
		);
	}

	const saleSummary = service.saleServices ?? [];
	const totalRevenue = saleSummary.reduce((sum, s) => sum + Number(s.total), 0);
	const totalQuantity = saleSummary.reduce((sum, s) => sum + s.quantity, 0);
	const totalDiscount = saleSummary.reduce(
		(sum, s) => sum + Number(s.discount ?? 0),
		0,
	);
	const margin =
		service.internalCost && service.salePrice
			? (
					((service.salePrice - service.internalCost) / service.salePrice) *
					100
				).toFixed(1)
			: null;

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => router.back()}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-2xl font-bold">{service.name}</h1>
					<p className="text-sm text-muted-foreground">Service Details</p>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-4">
				<MetricCard
					title="Sale Price"
					value={`${symbol}${Number(service.salePrice).toFixed(2)}`}
					icon={DollarSign}
				/>
				<MetricCard
					title="Internal Cost"
					value={
						service.internalCost != null
							? `${symbol}${Number(service.internalCost).toFixed(2)}`
							: "—"
					}
					icon={Tag}
				/>
				<MetricCard
					title="Total Revenue"
					value={`${symbol}${totalRevenue.toFixed(2)}`}
					icon={TrendingUp}
				/>
				<MetricCard
					title="Times Sold"
					value={totalQuantity.toString()}
					icon={ShoppingCart}
				/>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<Card className="md:col-span-1">
					<CardHeader>
						<CardTitle className="text-base">Service Info</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Category</span>
							<span className="font-medium">
								{service.category?.name ?? "—"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Subcategory</span>
							<span className="font-medium">
								{service.subCategory?.name ?? "—"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Profit Margin</span>
							<span className="font-medium">{margin ? `${margin}%` : "—"}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Total Discounts</span>
							<span className="font-medium">
								{symbol}
								{totalDiscount.toFixed(2)}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Created</span>
							<span className="font-medium">
								{new Date(service.createdAt).toLocaleDateString()}
							</span>
						</div>
						{service.description && (
							<div className="pt-2 border-t">
								<p className="text-muted-foreground mb-1">Description</p>
								<p>{service.description}</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="md:col-span-2">
					<CardHeader className="flex flex-row items-center gap-2">
						<Receipt className="h-4 w-4 text-muted-foreground" />
						<CardTitle className="text-base">Sales History</CardTitle>
					</CardHeader>
					<CardContent>
						{saleSummary.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
								<Layers className="h-8 w-8" />
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
										<TableHead className="text-right">Unit Price</TableHead>
										<TableHead className="text-right">Discount</TableHead>
										<TableHead className="text-right">Total</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{saleSummary.map((s: SaleService) => (
										<TableRow key={s.id}>
											<TableCell>
												{new Date(s.sale.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell>
												{s.sale.customer ? (
													<div>
														<p className="font-medium">
															{s.sale.customer.name}
														</p>
														<p className="text-xs text-muted-foreground">
															{s.sale.customer.phone}
														</p>
													</div>
												) : (
													<span className="text-muted-foreground">Walk-in</span>
												)}
											</TableCell>
											<TableCell>
												<Badge variant="outline" className="text-xs capitalize">
													{s.sale.paymentMethod.replace("_", " ")}
												</Badge>
											</TableCell>
											<TableCell className="text-right">{s.quantity}</TableCell>
											<TableCell className="text-right">
												{symbol}
												{Number(s.unitPrice).toFixed(2)}
											</TableCell>
											<TableCell className="text-right">
												{symbol}
												{Number(s.discount ?? 0).toFixed(2)}
											</TableCell>
											<TableCell className="text-right font-medium">
												{symbol}
												{Number(s.total).toFixed(2)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
