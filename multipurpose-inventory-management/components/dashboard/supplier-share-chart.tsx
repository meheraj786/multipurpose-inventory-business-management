"use client";

import { Cell, Pie, PieChart } from "recharts";
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

const COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
];

const chartConfig = {
	value: {
		label: "Purchase volume",
	},
} satisfies ChartConfig;

export function SupplierShareChart({
	data,
	symbol,
}: {
	data:
		| { supplierId: string; name: string; totalPurchase: number }[]
		| undefined;
	symbol: string;
}) {
	const top = (data ?? []).slice(0, 5);
	const othersTotal = (data ?? [])
		.slice(5)
		.reduce((s, d) => s + d.totalPurchase, 0);

	const chartData = [
		...top.map((s) => ({ name: s.name, value: s.totalPurchase })),
		...(othersTotal > 0 ? [{ name: "Others", value: othersTotal }] : []),
	];

	return (
		<Card className="border border-border/60 bg-gradient-to-b from-card to-card/95 shadow-sm">
			<CardHeader>
				<CardTitle className="text-base font-semibold">Top Suppliers</CardTitle>
				<CardDescription className="text-xs">
					Share of procurement spend
				</CardDescription>
			</CardHeader>
			<CardContent className="flex items-center gap-4">
				{chartData.length === 0 ? (
					<p className="text-xs text-muted-foreground text-center py-10 w-full">
						No recent supplier metrics
					</p>
				) : (
					<>
						<ChartContainer
							config={chartConfig}
							className="h-[180px] w-[180px] shrink-0"
						>
							<PieChart>
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
								<Pie
									data={chartData}
									dataKey="value"
									nameKey="name"
									innerRadius={45}
									outerRadius={75}
									paddingAngle={2}
									strokeWidth={2}
								>
									{chartData.map((entry, i) => (
										<Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
									))}
								</Pie>
							</PieChart>
						</ChartContainer>
						<div className="space-y-2 min-w-0 flex-1">
							{chartData.map((s, i) => (
								<div
									key={s.name}
									className="flex items-center justify-between gap-2 text-xs"
								>
									<span className="flex items-center gap-1.5 min-w-0">
										<span
											className="h-2 w-2 rounded-full shrink-0"
											style={{ background: COLORS[i % COLORS.length] }}
										/>
										<span className="truncate text-muted-foreground">
											{s.name}
										</span>
									</span>
									<span className="font-semibold tabular-nums shrink-0">
										{symbol}
										{s.value.toFixed(0)}
									</span>
								</div>
							))}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
