"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

type CategoryDatum = {
	categoryId: string;
	name: string;
	revenue: number;
};

const chartConfig = {
	revenue: {
		label: "Revenue",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

export function CategoryRevenueChart({
	data,
	symbol,
}: {
	data: CategoryDatum[] | undefined;
	symbol: string;
}) {
	const chartData = (data ?? [])
		.slice(0, 6)
		.map((c) => ({ name: c.name, revenue: c.revenue }));

	return (
		<Card className="border border-border/60 shadow-sm">
			<CardHeader className="pb-2">
				<CardTitle className="text-base font-semibold">
					Category Revenue
				</CardTitle>
				<CardDescription className="text-xs">
					Distribution of sales across item categories
				</CardDescription>
			</CardHeader>
			<CardContent>
				{chartData.length === 0 ? (
					<p className="text-xs text-muted-foreground text-center py-10">
						No sales recorded
					</p>
				) : (
					<ChartContainer config={chartConfig} className="h-[260px] w-full">
						<BarChart
							data={chartData}
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
								width={100}
								tickLine={false}
								axisLine={false}
								fontSize={11}
							/>
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
							<Bar
								dataKey="revenue"
								fill="var(--color-revenue)"
								radius={[0, 6, 6, 0]}
							/>
						</BarChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
