"use client";

import {
	AlertCircle,
	DollarSign,
	Receipt,
	TrendingDownIcon,
	TrendingUpIcon,
	Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface OverviewStats {
	totalRevenue?: number;
	revenueChangePercent?: number | null;
	salesCount?: number;
	salesCountChangePercent?: number | null;
	outstandingDues?: number;
	duesChangePercent?: number | null;
	avgOrderValue?: number;
	avgOrderValueChangePercent?: number | null;
	totalProfit?: number;
	profitChangePercent?: number | null;
	profitMargin?: number;
	profitMarginChangePercent?: number | null;
}

interface SectionCardsProps {
	stats?: OverviewStats;
	loading?: boolean;
	symbol?: string;
}

interface CardSub {
	label: string;
	value: string;
	badge: string;
}

interface CardData {
	title: string;
	value: string;
	change: number | null;
	description: string;
	icon: typeof DollarSign;
	invertTrend: boolean;
	sub: CardSub | null;
}

export function SectionCards({
	stats,
	loading = false,
	symbol = "$",
}: SectionCardsProps) {
	if (loading) {
		let i = 0;
		return (
			<div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
				{[...Array(4)].map((_) => (
					<Card key={i++} className="border border-border/50">
						<CardHeader className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-8 w-32" />
						</CardHeader>
						<CardContent className="space-y-2 pb-4">
							<Skeleton className="h-3 w-40" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	const money = (n = 0) =>
		`${symbol}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

	const cardsData: CardData[] = [
		{
			title: "Gross Revenue",
			value: money(stats?.totalRevenue),
			change: stats?.revenueChangePercent ?? null,
			description: "Net revenue for the selected period",
			icon: DollarSign,
			invertTrend: false,
			sub: {
				label: "Profit",
				value: money(stats?.totalProfit),
				badge: `${(stats?.profitMargin ?? 0).toFixed(1)}% margin`,
			},
		},
		{
			title: "Completed Sales",
			value: (stats?.salesCount ?? 0).toLocaleString(),
			change: stats?.salesCountChangePercent ?? null,
			description: "Sales recorded this period",
			icon: Receipt,
			invertTrend: false,
			sub: null,
		},
		{
			title: "Outstanding Dues",
			value: money(stats?.outstandingDues),
			change: stats?.duesChangePercent ?? null,
			description: "Unpaid balances across customers",
			icon: AlertCircle,
			invertTrend: true,
			sub: null,
		},
		{
			title: "Avg. Sale Value",
			value: money(stats?.avgOrderValue),
			change: stats?.avgOrderValueChangePercent ?? null,
			description: "Revenue divided by order count",
			icon: Wallet,
			invertTrend: false,
			sub: null,
		},
	];

	return (
		<div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			{cardsData.map((card) => {
				const IconComponent = card.icon;
				const hasChange = card.change !== null && card.change !== undefined;
				const isPositive =
					hasChange && card?.change !== null && card?.change >= 0;
				const isGood = card.invertTrend ? !isPositive : isPositive;

				return (
					<Card
						key={card.title}
						className="@container/card border border-border/60 bg-gradient-to-t from-primary/[0.02] to-card hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 dark:*:data-[slot=card]:bg-card"
					>
						<CardHeader className="relative pb-2">
							<CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
								{card.title}
								<IconComponent className="h-4 w-4 text-muted-foreground/80 stroke-[1.5]" />
							</CardDescription>
							<CardTitle className="text-2xl font-bold tracking-tight text-foreground tabular-nums @[250px]/card:text-3xl mt-1">
								{card.value}
							</CardTitle>
							<CardAction className="absolute top-11 right-4">
								{hasChange ? (
									<Badge
										variant={isGood ? "outline" : "destructive"}
										className={`flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] ${
											isGood
												? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
												: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20"
										}`}
									>
										{isPositive ? (
											<TrendingUpIcon className="size-3" />
										) : (
											<TrendingDownIcon className="size-3" />
										)}
										{isPositive ? "+" : ""}
										{card.change?.toFixed(1)}%
									</Badge>
								) : (
									<Badge
										variant="outline"
										className="px-1.5 py-0.5 text-[10px] text-muted-foreground"
									>
										All time
									</Badge>
								)}
							</CardAction>
						</CardHeader>
						<CardFooter className="flex-col items-start gap-1.5 text-xs pt-1">
							<div className="text-muted-foreground text-xs font-medium">
								{card.description}
							</div>
							{card.sub && (
								<div className="flex items-center gap-1.5 pt-1.5 mt-0.5 border-t border-border/30 w-full">
									<span className="text-[11px] text-muted-foreground">
										{card.sub.label}
									</span>
									<span className="text-xs font-semibold tabular-nums text-foreground">
										{card.sub.value}
									</span>
									<Badge
										variant="outline"
										className="ml-auto px-1.5 py-0 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
									>
										{card.sub.badge}
									</Badge>
								</div>
							)}
						</CardFooter>
					</Card>
				);
			})}
		</div>
	);
}
