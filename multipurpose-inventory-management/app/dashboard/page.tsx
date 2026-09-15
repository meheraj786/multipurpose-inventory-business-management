"use client";

import { format, subDays } from "date-fns";
import {
	AlertTriangle,
	CalendarIcon,
	Layers,
	Package,
	RefreshCw,
	Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	Bar,
	BarChart,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useCurrency } from "@/hooks/useCurrency";
import {
	useDashboardCategoryRanking,
	useDashboardDueRanking,
	useDashboardLowStockAlert,
	useDashboardOverviewStats,
	useDashboardProductRanking,
	useDashboardPurchaseOverview,
	useDashboardSalesOverview,
	useDashboardTopCustomers,
	useDashboardTopSuppliers,
} from "@/hooks/useDashboard";
import {
	isModuleAllowedForModel,
	useBusinessModel,
} from "@/lib/business-model";

type DateRangePreset =
	| "today"
	| "week"
	| "month"
	| "last3months"
	| "year"
	| "all"
	| "custom";

const RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
	{ value: "all", label: "All Time" },
	{ value: "today", label: "Today" },
	{ value: "week", label: "This Week" },
	{ value: "month", label: "This Month" },
	{ value: "last3months", label: "Last 3 Months" },
	{ value: "year", label: "This Year" },
	{ value: "custom", label: "Custom Range" },
];

const GREY_SCALE = [
	"#09090b", // Zinc 950
	"#27272a", // Zinc 800
	"#52525b", // Zinc 600
	"#8f8f94", // Neutral grey
	"#d4d4d8", // Zinc 300
];

export default function DashboardPage() {
	const { symbol } = useCurrency();
	const model = useBusinessModel();

	const showProducts = isModuleAllowedForModel("PRODUCT", model);
	const showRawProducts = isModuleAllowedForModel("RAW_PRODUCT", model);
	const showPreparedProducts = isModuleAllowedForModel(
		"PREPARED_PRODUCT",
		model,
	);
	const showSupplier = isModuleAllowedForModel("SUPPLIER", model);
	const showPurchase = isModuleAllowedForModel("PURCHASE", model);
	const showService = isModuleAllowedForModel("SERVICE", model);

	const showLowStockCard = showProducts || showRawProducts;
	const showBestSellersCard =
		showProducts || showPreparedProducts || showService;
	const showProcurementRow = showSupplier || showPurchase;

	const [range, setRange] = useState<DateRangePreset>("month");
	const [customStart, setCustomStart] = useState<string>(
		format(subDays(new Date(), 30), "yyyy-MM-dd"),
	);
	const [customEnd, setCustomEnd] = useState<string>(
		format(new Date(), "yyyy-MM-dd"),
	);

	const queryParams = useMemo(
		() => ({
			range,
			startDate: range === "custom" ? customStart : undefined,
			endDate: range === "custom" ? customEnd : undefined,
		}),
		[range, customStart, customEnd],
	);

	const { data: stats, isLoading: statsLoading } =
		useDashboardOverviewStats(queryParams);
	const { data: salesOverview, isLoading: chartLoading } =
		useDashboardSalesOverview(queryParams);
	const { data: topCustomers } = useDashboardTopCustomers({
		...queryParams,
		limit: 5,
	});
	const { data: dueRanking } = useDashboardDueRanking({
		...queryParams,
		limit: 5,
	});
	const { data: productRanking } = useDashboardProductRanking({
		...queryParams,
		limit: 5,
	});
	const { data: lowStockAlert } = useDashboardLowStockAlert();
	const { data: categoryRanking } = useDashboardCategoryRanking(queryParams);
	const { data: topSuppliers } = useDashboardTopSuppliers({
		...queryParams,
		limit: 5,
	});
	const { data: purchaseOverview } = useDashboardPurchaseOverview(queryParams);

	const chartData = useMemo(
		() =>
			salesOverview?.chart.map((d) => ({
				date: d.date,
				label: d.label,
				amount: d.amount,
				profit: d.profit,
				salesCount: d.salesCount,
			})) ?? [],
		[salesOverview],
	);

	const categoryChartData = useMemo(() => {
		if (!categoryRanking?.categories) return [];
		return categoryRanking.categories.map((c, i) => ({
			name: c.name,
			value: c.revenue,
			fill: GREY_SCALE[i % GREY_SCALE.length],
		}));
	}, [categoryRanking]);

	const customerChartData = useMemo(() => {
		if (!topCustomers) return [];
		return [...topCustomers].reverse().map((c) => ({
			name: c.name,
			value: c.totalPurchase,
		}));
	}, [topCustomers]);

	const hasBestSellerRows =
		!!productRanking &&
		((showProducts && productRanking.products.length > 0) ||
			(showPreparedProducts && productRanking.preparedProducts.length > 0) ||
			(showService && productRanking.services.length > 0));

	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<SidebarInset className="bg-zinc-50/50 dark:bg-zinc-950/40">
				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-4">
						<div className="flex flex-col gap-6 px-2 ">
							{/* Header area */}
							{/* <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
								<div>
									<h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
										Dashboard
									</h1>
									<p className="text-xs text-zinc-500 dark:text-zinc-400">
										Analytical summary of operations, balances, and inventory
									</p>
								</div>
							</div> */}

							{/* Clean Date Filter Block */}
							<div className="flex flex-wrap items-end gap-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-xs">
								<div className="space-y-1.5">
									<Label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1">
										<CalendarIcon className="h-3 w-3" /> Period
									</Label>
									<Select
										value={range}
										onValueChange={(v) => setRange(v as DateRangePreset)}
									>
										<SelectTrigger className="w-48 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
											<SelectValue placeholder="Select period" />
										</SelectTrigger>
										<SelectContent>
											{RANGE_OPTIONS.map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{range === "custom" && (
									<div className="flex flex-wrap gap-3 items-center">
										<div className="space-y-1.5">
											<Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
												Start
											</Label>
											<Input
												type="date"
												className="w-38 h-9 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300"
												value={customStart}
												onChange={(e) => setCustomStart(e.target.value)}
											/>
										</div>
										<div className="space-y-1.5">
											<Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
												End
											</Label>
											<Input
												type="date"
												className="w-38 h-9 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300"
												value={customEnd}
												onChange={(e) => setCustomEnd(e.target.value)}
											/>
										</div>
									</div>
								)}

								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setRange("month");
										setCustomStart(
											format(subDays(new Date(), 30), "yyyy-MM-dd"),
										);
										setCustomEnd(format(new Date(), "yyyy-MM-dd"));
									}}
									className="self-end h-9 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs"
								>
									<RefreshCw className="mr-2 h-3 w-3" /> Reset
								</Button>
							</div>

							{/* Standard Stats Overview */}
							<SectionCards
								stats={stats}
								loading={statsLoading}
								symbol={symbol}
							/>

							{/* Main Analytical Section */}
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
								{/* Sales Interactive Area Line Chart (Spans 2 columns on wide screens) */}
								<div className="lg:col-span-2">
									{chartLoading ? (
										<Card className="border border-zinc-200 dark:border-zinc-800">
											<CardHeader className="space-y-2">
												<Skeleton className="h-5 w-40" />
												<Skeleton className="h-4 w-60" />
											</CardHeader>
											<CardContent>
												<Skeleton className="h-[280px] w-full rounded-lg" />
											</CardContent>
										</Card>
									) : (
										<ChartAreaInteractive
											data={chartData}
											symbol={symbol}
											granularity={salesOverview?.granularity}
											totalProfit={salesOverview?.totalProfit}
											profitMargin={salesOverview?.profitMargin}
										/>
									)}
								</div>

								{/* Category Distribution Doughnut Chart (1 column) */}
								<Card className="border border-zinc-200 dark:border-zinc-800  bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between">
									<CardHeader className="pb-2">
										<div className="flex items-center gap-2">
											<Layers className="h-4 w-4 text-zinc-400" />
											<CardTitle className="text-sm font-semibold tracking-tight">
												Category Distribution
											</CardTitle>
										</div>
										<CardDescription className="text-xs">
											Revenue share by category
										</CardDescription>
									</CardHeader>
									<CardContent className="flex-1 flex flex-col justify-center">
										{categoryChartData.length === 0 ? (
											<div className="flex items-center justify-center py-12 text-xs text-zinc-400">
												No category ranking metrics
											</div>
										) : (
											<div className="space-y-6">
												<div className="h-[180px] w-full relative">
													<ResponsiveContainer width="100%" height="100%">
														<PieChart>
															<Pie
																data={categoryChartData}
																cx="50%"
																cy="50%"
																innerRadius={55}
																outerRadius={75}
																paddingAngle={4}
																dataKey="value"
															>
																{categoryChartData.map((entry, _index) => (
																	<Cell
																		key={`cell-${entry}`}
																		fill={entry.fill}
																	/>
																))}
															</Pie>
															<Tooltip
																formatter={(value: number) => [
																	`${symbol}${value.toFixed(2)}`,
																	"Revenue",
																]}
																contentStyle={{
																	backgroundColor: "#ffffff",
																	border: "1px solid rgba(63, 63, 70, 0.4)",
																	borderRadius: "6px",
																	color: "#fff",
																	fontSize: "12px",
																}}
															/>
														</PieChart>
													</ResponsiveContainer>
													<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
														<span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
															Categories
														</span>
														<span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
															{categoryChartData.length}
														</span>
													</div>
												</div>
												<div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-[110px] overflow-y-auto px-1">
													{categoryChartData.map((item, _index) => (
														<div
															key={item.name}
															className="flex items-center gap-2"
														>
															<span
																className="h-2.5 w-2.5 rounded-full shrink-0"
																style={{ backgroundColor: item.fill }}
															/>
															<span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 truncate max-w-[90px]">
																{item.name}
															</span>
															<span className="text-[10px] tabular-nums font-semibold text-zinc-900 dark:text-zinc-200 ml-auto">
																{symbol}
																{item.value.toFixed(0)}
															</span>
														</div>
													))}
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							</div>

							{/* Secondary Row (Top Customers Chart, Dynamic Outstanding Dues, Stock Alerts) */}
							<div
								className={`grid gap-6 md:grid-cols-2 ${
									showLowStockCard ? "lg:grid-cols-3" : "lg:grid-cols-2"
								}`}
							>
								{/* Top Customers (Visualized Bar chart) */}
								<Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm flex flex-col justify-between">
									<CardHeader className="pb-3">
										<div className="flex items-center justify-between">
											<div className="space-y-0.5">
												<CardTitle className="text-sm font-semibold tracking-tight">
													Top Customers
												</CardTitle>
												<CardDescription className="text-xs text-zinc-400">
													Relative share of volume
												</CardDescription>
											</div>
											<Users className="h-4 w-4 text-zinc-400" />
										</div>
									</CardHeader>
									<CardContent className="flex-1 flex flex-col justify-center">
										{customerChartData.length === 0 ? (
											<p className="text-xs text-zinc-400 text-center py-6">
												No purchases recorded
											</p>
										) : (
											<div className="h-[210px] w-full">
												<ResponsiveContainer width="100%" height="100%">
													<BarChart
														layout="vertical"
														data={customerChartData}
														margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
													>
														<XAxis type="number" hide />
														<YAxis
															type="category"
															dataKey="name"
															stroke="#888888"
															fontSize={11}
															tickLine={false}
															axisLine={false}
														/>
														<Tooltip
															formatter={(value: number) => [
																`${symbol}${value.toFixed(2)}`,
																"Spent",
															]}
															contentStyle={{
																backgroundColor: "#ffffff",
																border: "1px solid rgba(63, 63, 70, 0.4)",
																borderRadius: "6px",
																color: "#fff",
																fontSize: "12px",
															}}
														/>
														<Bar
															dataKey="value"
															fill="#27272a"
															radius={[0, 4, 4, 0]}
															maxBarSize={16}
														>
															{customerChartData.map((entry, index) => (
																<Cell
																	key={`cell-${entry}`}
																	fill={
																		index === customerChartData.length - 1
																			? "#09090b"
																			: "#52525b"
																	}
																/>
															))}
														</Bar>
													</BarChart>
												</ResponsiveContainer>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Outstanding Dues */}
								<Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm">
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
										<div>
											<CardTitle className="text-sm font-semibold tracking-tight">
												Outstanding Dues
											</CardTitle>
											<CardDescription className="text-xs text-zinc-400">
												Accounts with pending balances
											</CardDescription>
										</div>
										<AlertTriangle className="h-4 w-4 text-zinc-500" />
									</CardHeader>
									<CardContent className="space-y-4 max-h-[220px] overflow-auto pr-1">
										{!dueRanking || dueRanking.length === 0 ? (
											<p className="text-xs text-zinc-400 text-center py-12">
												All accounts settled
											</p>
										) : (
											dueRanking.map((c) => (
												<div
													key={c.customerId}
													className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/40 pb-2.5 last:border-0 last:pb-0"
												>
													<span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
														{c.name}
													</span>
													<span className="text-xs font-semibold tabular-nums text-zinc-950 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded">
														{symbol}
														{c.totalDue.toFixed(2)}
													</span>
												</div>
											))
										)}
									</CardContent>
								</Card>

								{/* Low Stock Alerts */}
								{showLowStockCard && (
									<Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm">
										<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
											<div>
												<CardTitle className="text-sm font-semibold tracking-tight">
													Low Stock Alerts
												</CardTitle>
												<CardDescription className="text-xs text-zinc-400">
													Quantities near or under threshold
												</CardDescription>
											</div>
											<div className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-50 animate-pulse" />
										</CardHeader>
										<CardContent className="space-y-3 max-h-[220px] overflow-auto pr-1">
											{!lowStockAlert ||
											((!showProducts || lowStockAlert.products.length === 0) &&
												(!showRawProducts ||
													lowStockAlert.rawProducts.length === 0)) ? (
												<p className="text-xs text-zinc-400 text-center py-12">
													All levels acceptable
												</p>
											) : (
												<>
													{showProducts &&
														lowStockAlert.products.map((p) => (
															<div
																key={p.id}
																className="flex justify-between items-center text-xs border-b border-zinc-100 dark:border-zinc-800/40 pb-2 last:border-0 last:pb-0"
															>
																<span
																	className="text-zinc-800 dark:text-zinc-200 font-medium truncate max-w-[150px]"
																	title={p.name}
																>
																	{p.name}
																</span>
																<span className="text-[11px] font-semibold tabular-nums text-zinc-950 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/40 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700/50">
																	{p.currentStock} {p.unit ?? ""}
																</span>
															</div>
														))}
													{showRawProducts &&
														lowStockAlert.rawProducts.map((rp) => (
															<div
																key={rp.id}
																className="flex justify-between items-center text-xs border-b border-zinc-100 dark:border-zinc-800/40 pb-2 last:border-0 last:pb-0"
															>
																<span
																	className="text-zinc-500 font-medium truncate max-w-[150px]"
																	title={rp.name}
																>
																	{rp.name}{" "}
																	<span className="text-[9px] text-zinc-400">
																		(Raw)
																	</span>
																</span>
																<span className="text-[11px] font-semibold tabular-nums text-zinc-950 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/40 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700/50">
																	{rp.currentStock} {rp.unit ?? ""}
																</span>
															</div>
														))}
												</>
											)}
										</CardContent>
									</Card>
								)}
							</div>

							{/* Third Row (Best Sellers List) */}
							{showBestSellersCard && (
								<Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
									<CardHeader className="pb-3 flex flex-row items-center justify-between">
										<div>
											<CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
												<Package className="h-4 w-4 text-zinc-400" /> Best
												Sellers
											</CardTitle>
											<CardDescription className="text-xs text-zinc-400">
												Highest performance items by units sold and generated
												revenue
											</CardDescription>
										</div>
									</CardHeader>
									<CardContent className="p-0">
										<div className="border-t border-zinc-100 dark:border-zinc-800">
											<Table>
												<TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
													<TableRow className="border-zinc-100 dark:border-zinc-800">
														<TableHead className="py-2.5 text-xs text-zinc-500">
															Name
														</TableHead>
														<TableHead className="text-right py-2.5 text-xs text-zinc-500">
															Qty
														</TableHead>
														<TableHead className="text-right py-2.5 text-xs text-zinc-500">
															Revenue
														</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{!productRanking || !hasBestSellerRows ? (
														<TableRow>
															<TableCell
																colSpan={3}
																className="text-center py-10 text-zinc-400 text-xs"
															>
																No transaction records found
															</TableCell>
														</TableRow>
													) : (
														<>
															{showProducts &&
																productRanking.products.map((p) => (
																	<TableRow
																		key={p.productId}
																		className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 border-zinc-100 dark:border-zinc-800"
																	>
																		<TableCell className="font-medium text-xs text-zinc-900 dark:text-zinc-200">
																			{p.name}
																		</TableCell>
																		<TableCell className="text-right text-xs tabular-nums font-medium text-zinc-600 dark:text-zinc-400">
																			{p.quantity}
																		</TableCell>
																		<TableCell className="text-right text-xs tabular-nums font-semibold text-zinc-900 dark:text-zinc-50">
																			{symbol}
																			{p.revenue.toFixed(2)}
																		</TableCell>
																	</TableRow>
																))}
															{showPreparedProducts &&
																productRanking.preparedProducts.map((pp) => (
																	<TableRow
																		key={pp.preparedProductId}
																		className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 border-zinc-100 dark:border-zinc-800"
																	>
																		<TableCell className="font-medium text-xs text-zinc-900 dark:text-zinc-200">
																			{pp.name}{" "}
																			<span className="text-[10px] text-zinc-400 font-normal">
																				(Menu)
																			</span>
																		</TableCell>
																		<TableCell className="text-right text-xs tabular-nums font-medium text-zinc-600 dark:text-zinc-400">
																			{pp.quantity}
																		</TableCell>
																		<TableCell className="text-right text-xs tabular-nums font-semibold text-zinc-900 dark:text-zinc-50">
																			{symbol}
																			{pp.revenue.toFixed(2)}
																		</TableCell>
																	</TableRow>
																))}
															{showService &&
																productRanking.services.map((s) => (
																	<TableRow
																		key={s.serviceId}
																		className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 border-zinc-100 dark:border-zinc-800"
																	>
																		<TableCell className="font-medium text-xs text-zinc-900 dark:text-zinc-200">
																			{s.name}{" "}
																			<span className="text-[10px] text-zinc-400 font-normal">
																				(Service)
																			</span>
																		</TableCell>
																		<TableCell className="text-right text-xs tabular-nums font-medium text-zinc-600 dark:text-zinc-400">
																			{s.quantity}
																		</TableCell>
																		<TableCell className="text-right text-xs tabular-nums font-semibold text-zinc-900 dark:text-zinc-50">
																			{symbol}
																			{s.revenue.toFixed(2)}
																		</TableCell>
																	</TableRow>
																))}
														</>
													)}
												</TableBody>
											</Table>
										</div>
									</CardContent>
								</Card>
							)}

							{/* Procurement Summary & Suppliers (Final Row) */}
							{showProcurementRow && (
								<div
									className={`grid gap-6 ${
										showSupplier && showPurchase ? "md:grid-cols-2" : ""
									}`}
								>
									{showSupplier && (
										<Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
											<CardHeader className="pb-3">
												<CardTitle className="text-sm font-semibold tracking-tight">
													Top Suppliers
												</CardTitle>
												<CardDescription className="text-xs text-zinc-400">
													Highest volume procurement vendors
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-4">
												{!topSuppliers || topSuppliers.length === 0 ? (
													<p className="text-xs text-zinc-400 text-center py-6">
														No supplier metrics
													</p>
												) : (
													topSuppliers.map((s) => (
														<div
															key={s.supplierId}
															className="flex justify-between items-center text-xs border-b border-zinc-100 dark:border-zinc-800/40 pb-2.5 last:border-0 last:pb-0"
														>
															<span className="font-medium text-zinc-800 dark:text-zinc-200">
																{s.name}
															</span>
															<span className="text-[11px] font-semibold tabular-nums text-zinc-500">
																{s.totalQuantity} units ·{" "}
																<span className="text-zinc-900 dark:text-zinc-100 font-bold">
																	{symbol}
																	{s.totalPurchase.toFixed(2)}
																</span>
															</span>
														</div>
													))
												)}
											</CardContent>
										</Card>
									)}

									{showPurchase && (
										<Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
											<CardHeader className="pb-3">
												<CardTitle className="text-sm font-semibold tracking-tight">
													Purchases Summary
												</CardTitle>
												<CardDescription className="text-xs text-zinc-400">
													Material and stock acquisition aggregates
												</CardDescription>
											</CardHeader>
											<CardContent>
												{purchaseOverview ? (
													<div className="space-y-3.5 text-xs">
														<div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/40 pb-2.5">
															<span className="text-zinc-500">
																Total Invoices
															</span>
															<span className="font-semibold text-zinc-900 dark:text-zinc-100">
																{purchaseOverview.totalPurchases}
															</span>
														</div>
														<div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/40 pb-2.5">
															<span className="text-zinc-500">
																Stock Units Acquired
															</span>
															<span className="font-semibold text-zinc-900 dark:text-zinc-100">
																{purchaseOverview.totalQuantity}
															</span>
														</div>
														<div className="flex justify-between pt-1">
															<span className="text-zinc-500">
																Total Invested Cost
															</span>
															<span className="font-bold tabular-nums text-zinc-950 dark:text-zinc-50">
																{symbol}
																{purchaseOverview.totalCost.toFixed(2)}
															</span>
														</div>
													</div>
												) : (
													<p className="text-xs text-zinc-400 text-center py-6">
														No purchase summary data available
													</p>
												)}
											</CardContent>
										</Card>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
