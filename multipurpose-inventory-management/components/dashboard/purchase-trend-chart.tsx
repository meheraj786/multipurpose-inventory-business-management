"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

type PurchasePoint = {
	date: string;
	cost: number;
	quantity: number;
	purchases: number;
};

const chartConfig = {
	cost: {
		label: "Cost",
		color: "var(--chart-4)",
	},
} satisfies ChartConfig;

export function PurchaseTrendChart({
	data,
	totalPurchases,
	totalQuantity,
	totalCost,
	symbol,
}: {
	data: PurchasePoint[] | undefined;
	totalPurchases: number | undefined;
	totalQuantity: number | undefined;
	totalCost: number | undefined;
	symbol: string;
}) {
	return (
		<Card className="border border-border/60 bg-gradient-to-b from-card to-card/95 shadow-sm">
			<CardHeader>
				<CardTitle className="text-base font-semibold">
					Purchases Summary
				</CardTitle>
				<CardDescription className="text-xs">
					Raw material & stock acquisition aggregate
				</CardDescription>
			</CardHeader>
			<CardContent>
				{!data || data.length === 0 ? (
					<p className="text-xs text-muted-foreground text-center py-10">
						No purchase summaries available
					</p>
				) : (
					<>
						<div className="flex justify-between text-sm mb-3">
							<div>
								<p className="text-[11px] text-muted-foreground uppercase tracking-wide">
									Invoices
								</p>
								<p className="font-semibold text-foreground">
									{totalPurchases}
								</p>
							</div>
							<div>
								<p className="text-[11px] text-muted-foreground uppercase tracking-wide">
									Units
								</p>
								<p className="font-semibold text-foreground">{totalQuantity}</p>
							</div>
							<div className="text-right">
								<p className="text-[11px] text-muted-foreground uppercase tracking-wide">
									Total Cost
								</p>
								<p className="font-bold tabular-nums text-primary">
									{symbol}
									{totalCost?.toFixed(2)}
								</p>
							</div>
						</div>
						<ChartContainer config={chartConfig} className="h-[160px] w-full">
							<AreaChart data={data} margin={{ left: 0, right: 8, top: 4 }}>
								<defs>
									<linearGradient
										id="purchaseCostFill"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="5%"
											stopColor="var(--chart-4)"
											stopOpacity={0.35}
										/>
										<stop
											offset="95%"
											stopColor="var(--chart-4)"
											stopOpacity={0}
										/>
									</linearGradient>
								</defs>
								<CartesianGrid vertical={false} strokeDasharray="3 3" />
								<XAxis
									dataKey="date"
									tickLine={false}
									axisLine={false}
									fontSize={10}
									minTickGap={24}
								/>
								<YAxis hide />
								<ChartTooltip
									content={
										<ChartTooltipContent
											formatter={(value) => (
												<span className="font-medium tabular-nums">
													{symbol}
													{Number(value).toFixed(2)}
												</span>
											)}
										/>
									}
								/>
								<Area
									dataKey="cost"
									type="monotone"
									stroke="var(--chart-4)"
									fill="url(#purchaseCostFill)"
									strokeWidth={2}
								/>
							</AreaChart>
						</ChartContainer>
					</>
				)}
			</CardContent>
		</Card>
	);
}
