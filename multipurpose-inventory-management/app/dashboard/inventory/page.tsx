"use client";

import {
	AlertTriangle,
	CheckCircle2,
	ChevronRight,
	CircleAlert,
	Package,
	PackageSearch,
	TrendingUp,
	Warehouse,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MetricCard } from "@/components/appComponents/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useGetProducts } from "@/hooks/useProducts";

type FilterType = "all" | "low" | "out";

const FILTER_LABELS: Record<FilterType, string> = {
	all: "All Products",
	low: "Low Stock",
	out: "Out of Stock",
};

function StockBadge({ stock, alert }: { stock: number; alert: number | null }) {
	const isOut = stock === 0;
	const isLow = alert !== null && stock > 0 && stock <= alert;

	if (isOut) {
		return (
			<Badge
				variant="outline"
				className="border-destructive text-destructive gap-1"
			>
				<CircleAlert className="h-3 w-3" />
				Out of stock
			</Badge>
		);
	}
	if (isLow) {
		return (
			<Badge
				variant="outline"
				className="border-orange-400 text-orange-600 gap-1"
			>
				<AlertTriangle className="h-3 w-3" />
				{stock} / {alert}
			</Badge>
		);
	}
	return (
		<Badge variant="outline" className="border-green-500 text-green-700 gap-1">
			<CheckCircle2 className="h-3 w-3" />
			{stock} units
		</Badge>
	);
}

function AlertCard({
	title,
	icon: Icon,
	items,
	colorClass,
	borderClass,
	badgeRenderer,
	onItemClick,
}: {
	title: string;
	icon: React.ElementType;
	items: {
		id: string;
		name: string;
		sku?: string | null;
		totalStock?: number | null;
		lowStockAlert?: string | number | null;
	}[];
	colorClass: string;
	borderClass: string;
	badgeRenderer: (item: {
		totalStock?: number | null;
		lowStockAlert?: string | number | null;
	}) => React.ReactNode;
	onItemClick: (id: string) => void;
}) {
	return (
		<Card className={`${borderClass}`}>
			<CardHeader className="pb-3">
				<CardTitle className={`text-sm flex items-center gap-2 ${colorClass}`}>
					<Icon className="h-4 w-4" />
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-1">
				{items.slice(0, 5).map((p) => (
					<button
						type="button"
						key={p.id}
						className="w-full flex items-center justify-between text-sm hover:bg-muted/50 rounded px-2 py-1.5 text-left transition-colors group"
						onClick={() => onItemClick(p.id)}
					>
						<div className="flex items-center gap-2 min-w-0">
							<span className="font-medium truncate">{p.name}</span>
							{p.sku && (
								<span className="text-xs text-muted-foreground font-mono shrink-0">
									{p.sku}
								</span>
							)}
						</div>
						<div className="flex items-center gap-2 shrink-0">
							{badgeRenderer(p)}
							<ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
						</div>
					</button>
				))}
				{items.length > 5 && (
					<p className="text-xs text-muted-foreground text-center pt-2 border-t mt-2">
						+{items.length - 5} more items
					</p>
				)}
			</CardContent>
		</Card>
	);
}

export default function InventoryPage() {
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<FilterType>("all");
	const { symbol } = useCurrency();

	const { data: result, isLoading } = useGetProducts({
		page: 1,
		pageSize: 1000,
		search: search || undefined,
	});

	const products = result?.data ?? [];

	const outOfStock = products.filter((p) => (p.totalStock ?? 0) === 0);
	const lowStock = products.filter((p) => {
		const alert = p.lowStockAlert ? Number(p.lowStockAlert) : null;
		const stock = p.totalStock ?? 0;
		return alert !== null && stock > 0 && stock <= alert;
	});
	const totalStockValue = products.reduce(
		(sum, p) => sum + (p.totalStock ?? 0) * Number(p.defaultSalePrice ?? 0),
		0,
	);
	const totalUnits = products.reduce((sum, p) => sum + (p.totalStock ?? 0), 0);

	const filtered = products.filter((p) => {
		if (filter === "out") return (p.totalStock ?? 0) === 0;
		if (filter === "low") {
			const alert = p.lowStockAlert ? Number(p.lowStockAlert) : null;
			const stock = p.totalStock ?? 0;
			return alert !== null && stock > 0 && stock <= alert;
		}
		return true;
	});

	const navigateTo = (id: string) => router.push(`/dashboard/products/${id}`);

	const hasAlerts = lowStock.length > 0 || outOfStock.length > 0;

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
					<p className="text-sm text-muted-foreground mt-0.5">
						Stock levels and alerts across all products
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => router.push("/dashboard/products")}
				>
					<Package className="h-4 w-4 mr-1.5" />
					All Products
				</Button>
			</div>

			{/* Metrics */}
			<div className="grid gap-4 md:grid-cols-4">
				<MetricCard
					title="Total Products"
					value={products.length.toString()}
					icon={Package}
				/>
				<MetricCard
					title="Total Units"
					value={totalUnits.toString()}
					icon={Warehouse}
				/>
				<MetricCard
					title="Low Stock"
					value={lowStock.length.toString()}
					icon={AlertTriangle}
				/>
				<MetricCard
					title="Stock Value"
					value={`${symbol}${totalStockValue.toFixed(2)}`}
					icon={TrendingUp}
				/>
			</div>

			{/* Alert Cards */}
			{hasAlerts && (
				<div>
					<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
						Needs Attention
					</h2>
					<div className="grid gap-4 md:grid-cols-2">
						{outOfStock.length > 0 && (
							<AlertCard
								title={`Out of Stock (${outOfStock.length})`}
								icon={PackageSearch}
								items={outOfStock}
								colorClass="text-destructive"
								borderClass="border-destructive/40"
								onItemClick={navigateTo}
								badgeRenderer={(_p) => (
									<Badge variant="destructive" className="text-xs">
										0 units
									</Badge>
								)}
							/>
						)}
						{lowStock.length > 0 && (
							<AlertCard
								title={`Low Stock (${lowStock.length})`}
								icon={AlertTriangle}
								items={lowStock}
								colorClass="text-orange-600"
								borderClass="border-orange-300/50"
								onItemClick={navigateTo}
								badgeRenderer={(p) => (
									<Badge
										variant="outline"
										className="text-xs border-orange-400 text-orange-600"
									>
										{p.totalStock ?? 0} / {p.lowStockAlert}
									</Badge>
								)}
							/>
						)}
					</div>
				</div>
			)}

			{/* Stock Table */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="text-base">Stock Levels</CardTitle>
						<span className="text-xs text-muted-foreground">
							{filtered.length} product{filtered.length !== 1 ? "s" : ""}
						</span>
					</div>
					<div className="flex items-center gap-3 mt-3 flex-wrap">
						<div className="relative">
							<PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
							<Input
								placeholder="Search products..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-9 max-w-xs"
							/>
						</div>
						<div className="flex gap-1 border rounded-md p-0.5 bg-muted/40">
							{(["all", "low", "out"] as const).map((f) => (
								<Button
									key={f}
									variant={filter === f ? "default" : "ghost"}
									size="sm"
									className="h-7 text-xs px-3"
									onClick={() => setFilter(f)}
								>
									{FILTER_LABELS[f]}
									{f === "low" && lowStock.length > 0 && (
										<span className="ml-1.5 bg-orange-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
											{lowStock.length}
										</span>
									)}
									{f === "out" && outOfStock.length > 0 && (
										<span className="ml-1.5 bg-destructive text-destructive-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
											{outOfStock.length}
										</span>
									)}
								</Button>
							))}
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="space-y-px p-4">
							{[...Array(8)].map((_, i) => (
								<div
									key={i.toString()}
									className="h-12 bg-muted animate-pulse rounded"
								/>
							))}
						</div>
					) : filtered.length === 0 ? (
						<div className="text-center py-16 text-muted-foreground">
							<Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
							<p className="text-sm font-medium">No products found</p>
							<p className="text-xs mt-1">
								Try adjusting your search or filter
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow className="hover:bg-transparent">
									<TableHead>Product</TableHead>
									<TableHead>SKU</TableHead>
									<TableHead>Category</TableHead>
									<TableHead className="text-right">Purchase</TableHead>
									<TableHead className="text-right">Sale</TableHead>
									<TableHead className="text-right">Alert At</TableHead>
									<TableHead className="text-right">Stock</TableHead>
									<TableHead className="text-right">Value</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{filtered.map((product) => {
									const stock = product.totalStock ?? 0;
									const alert = product.lowStockAlert
										? Number(product.lowStockAlert)
										: null;
									const stockVal =
										stock * Number(product.defaultSalePrice ?? 0);

									return (
										<TableRow
											key={product.id}
											className="cursor-pointer hover:bg-muted/50 group"
											onClick={() => navigateTo(product.id)}
										>
											<TableCell className="font-medium">
												{product.name}
											</TableCell>
											<TableCell className="font-mono text-xs text-muted-foreground">
												{product.sku ?? "—"}
											</TableCell>
											<TableCell className="text-muted-foreground">
												{product.category?.name ?? "—"}
											</TableCell>
											<TableCell className="text-right tabular-nums">
												{symbol}
												{Number(product.defaultPurchasePrice ?? 0).toFixed(2)}
											</TableCell>
											<TableCell className="text-right tabular-nums">
												{symbol}
												{Number(product.defaultSalePrice ?? 0).toFixed(2)}
											</TableCell>
											<TableCell className="text-right text-muted-foreground tabular-nums">
												{alert ?? "—"}
											</TableCell>
											<TableCell className="text-right">
												<StockBadge stock={stock} alert={alert} />
											</TableCell>
											<TableCell className="text-right font-medium tabular-nums">
												{symbol}
												{stockVal.toFixed(2)}
											</TableCell>
											<TableCell
												className="text-right"
												onClick={(e) => e.stopPropagation()}
											>
												<Button
													variant="ghost"
													size="sm"
													className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
													onClick={() => navigateTo(product.id)}
												>
													Manage
													<ChevronRight className="h-3 w-3 ml-1" />
												</Button>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
