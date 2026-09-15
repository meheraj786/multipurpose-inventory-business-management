"use client";

import {
	Area,
	Bar,
	CartesianGrid,
	ComposedChart,
	Line,
	XAxis,
	YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
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

interface ChartDataPoint {
	date: string;
	label: string;
	amount: number;
	profit: number;
	salesCount: number;
}

interface ChartAreaInteractiveProps {
	data: ChartDataPoint[];
	symbol?: string;
	granularity?: "day" | "week" | "month";
	totalProfit?: number;
	profitMargin?: number;
}

const chartConfig = {
	amount: { label: "Revenue", color: "hsl(var(--primary))" },
	profit: { label: "Profit", color: "hsl(142, 71%, 45%)" },
	salesCount: { label: "Orders", color: "hsl(var(--muted-foreground))" },
} satisfies ChartConfig;

const granularityCopy: Record<string, string> = {
	day: "Day-by-day",
	week: "Week-by-week",
	month: "Month-by-month",
};

export function ChartAreaInteractive({
	data,
	symbol = "$",
	granularity = "day",
	totalProfit,
	profitMargin,
}: ChartAreaInteractiveProps) {
	return (
		<Card className="@container/card border border-border/60 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
			<CardHeader className="flex flex-col gap-2 border-b border-border/40 bg-muted/10 py-5 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1">
					<CardTitle className="text-lg font-semibold tracking-tight">
						Sales Over Time
					</CardTitle>
					<CardDescription className="text-xs text-muted-foreground">
						{granularityCopy[granularity] ?? "Breakdown"} · revenue, profit, and
						order volume
					</CardDescription>
				</div>
				{totalProfit !== undefined && (
					<CardAction>
						<Badge
							variant="outline"
							className="flex items-center gap-1 px-2 py-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
						>
							Profit {symbol}
							{totalProfit.toFixed(2)} · {(profitMargin ?? 0).toFixed(1)}%
							margin
						</Badge>
					</CardAction>
				)}
			</CardHeader>
			<CardContent className="px-2 pt-6 sm:px-6">
				{data.length === 0 ? (
					<div className="flex h-[280px] flex-col items-center justify-center gap-1 text-sm text-muted-foreground">
						<span>No sales records inside this time frame.</span>
						<span className="text-xs">Try widening the date filter above.</span>
					</div>
				) : (
					<ChartContainer
						config={chartConfig}
						className="aspect-auto h-[280px] w-full"
					>
						<ComposedChart data={data} margin={{ left: 4, right: 4 }}>
							<defs>
								<linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
									<stop
										offset="5%"
										stopColor="var(--color-amount)"
										stopOpacity={0.35}
									/>
									<stop
										offset="95%"
										stopColor="var(--color-amount)"
										stopOpacity={0.02}
									/>
								</linearGradient>
							</defs>
							<CartesianGrid
								vertical={false}
								strokeDasharray="3 3"
								className="stroke-muted/40"
							/>
							<XAxis
								dataKey="label"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								minTickGap={28}
								className="text-xs text-muted-foreground font-medium"
							/>
							<YAxis
								yAxisId="amount"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								tickFormatter={(value) => `${symbol}${value}`}
								className="text-xs text-muted-foreground font-medium"
							/>
							<YAxis
								yAxisId="count"
								orientation="right"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								allowDecimals={false}
								className="text-xs text-muted-foreground font-medium"
							/>
							<ChartTooltip
								cursor={{ fill: "var(--muted)", opacity: 0.12 }}
								content={
									<ChartTooltipContent
										labelKey="label"
										formatter={(value, name) => {
											if (name === "amount") {
												return [
													<span
														key="v"
														className="font-semibold text-foreground"
													>
														{symbol}
														{Number(value).toFixed(2)}
													</span>,
													"Revenue",
												];
											}
											if (name === "profit") {
												return [
													<span
														key="v"
														className="font-semibold text-emerald-600 dark:text-emerald-400"
													>
														{symbol}
														{Number(value).toFixed(2)}
													</span>,
													"Profit",
												];
											}
											return [
												<span key="v" className="font-semibold text-foreground">
													{value}
												</span>,
												"Sales",
											];
										}}
									/>
								}
							/>
							<Bar
								yAxisId="count"
								dataKey="salesCount"
								fill="var(--color-salesCount)"
								radius={[4, 4, 0, 0]}
								barSize={18}
								opacity={0.3}
							/>
							<Area
								yAxisId="amount"
								dataKey="amount"
								type="monotone"
								fill="url(#fillAmount)"
								stroke="var(--color-amount)"
								strokeWidth={2}
								activeDot={{
									r: 4,
									style: { fill: "var(--color-amount)", opacity: 0.9 },
								}}
							/>
							<Line
								yAxisId="amount"
								dataKey="profit"
								type="monotone"
								stroke="var(--color-profit)"
								strokeWidth={2}
								dot={false}
								activeDot={{
									r: 4,
									style: { fill: "var(--color-profit)", opacity: 0.9 },
								}}
							/>
						</ComposedChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
