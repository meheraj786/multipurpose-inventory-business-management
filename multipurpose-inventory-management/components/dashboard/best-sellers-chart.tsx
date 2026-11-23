"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

type ItemType = "Product" | "Menu" | "Service";

type Item = {
	name: string;
	revenue: number;
	type: ItemType;
};

const TYPE_COLOR: Record<ItemType, string> = {
	Product: "var(--chart-1)",
	Menu: "var(--chart-2)",
	Service: "var(--chart-3)",
};

const chartConfig = {
	revenue: {
		label: "Revenue",
	},
} satisfies ChartConfig;

export function BestSellersChart({
	products,
	preparedProducts,
	services,
	symbol,
	showProducts,
	showPreparedProducts,
	showService,
}: {
	products: { name: string; revenue: number }[] | undefined;
	preparedProducts: { name: string; revenue: number }[] | undefined;
	services: { name: string; revenue: number }[] | undefined;
	symbol: string;
	showProducts: boolean;
	showPreparedProducts: boolean;
	showService: boolean;
}) {
	const items: Item[] = [
		...(showProducts
			? (products ?? []).map((p) => ({ ...p, type: "Product" as const }))
			: []),
		...(showPreparedProducts
			? (preparedProducts ?? []).map((p) => ({ ...p, type: "Menu" as const }))
			: []),
		...(showService
			? (services ?? []).map((p) => ({ ...p, type: "Service" as const }))
			: []),
	]
		.sort((a, b) => b.revenue - a.revenue)
		.slice(0, 6);

	return (
		<Card className="border border-border/60 shadow-sm">
			<CardHeader className="pb-2">
				<CardTitle className="text-base font-semibold">Best Sellers</CardTitle>
				<CardDescription className="text-xs">
					Top revenue generators this period, by type
				</CardDescription>
			</CardHeader>
			<CardContent>
				{items.length === 0 ? (
					<p className="text-xs text-muted-foreground text-center py-10">
						No sales recorded
					</p>
				) : (
					<ChartContainer config={chartConfig} className="h-[260px] w-full">
						<BarChart
							data={items}
							layout="vertical"
							margin={{ left: 8, right: 16 }}
						>
							<CartesianGrid horizontal={false} strokeDasharray="3 3" />
							<XAxis
								type="number"
								tickFormatter={(v) => `${symbol}${v}`}
								tickLine={false}
								axisLine={false}
								fontSize={11}
							/>
							<YAxis
								dataKey="name"
								type="category"
								width={110}
								tickLine={false}
								axisLine={false}
								fontSize={11}
							/>
							<ChartTooltip
								content={
									<ChartTooltipContent
										formatter={(value, _name, item) => (
											<span className="font-medium tabular-nums">
												{symbol}
												{Number(value).toFixed(2)}
												<span className="text-muted-foreground font-normal">
													{" "}
													· {item?.payload?.type}
												</span>
											</span>
										)}
									/>
								}
							/>
							<Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
								{items.map((entry) => (
									<Cell
										key={entry.name} // ← Fixed: use stable name instead of index
										fill={TYPE_COLOR[entry.type]}
									/>
								))}
							</Bar>
						</BarChart>
					</ChartContainer>
				)}

				<div className="flex items-center gap-4 pt-3 text-[11px] text-muted-foreground">
					{showProducts && (
						<span className="flex items-center gap-1.5">
							<span
								className="h-2 w-2 rounded-full"
								style={{ background: "var(--chart-1)" }}
							/>
							Product
						</span>
					)}
					{showPreparedProducts && (
						<span className="flex items-center gap-1.5">
							<span
								className="h-2 w-2 rounded-full"
								style={{ background: "var(--chart-2)" }}
							/>
							Menu
						</span>
					)}
					{showService && (
						<span className="flex items-center gap-1.5">
							<span
								className="h-2 w-2 rounded-full"
								style={{ background: "var(--chart-3)" }}
							/>
							Service
						</span>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
