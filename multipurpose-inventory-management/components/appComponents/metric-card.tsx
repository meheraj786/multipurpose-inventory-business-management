import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
	title: string;
	value: string | number;
	icon: LucideIcon; // This is the specific type for Lucide react icons
	className?: string; // Optional: allows you to override styles if needed
}

export function MetricCard({
	title,
	value,
	icon: Icon,
	className,
}: MetricCardProps) {
	return (
		// Changed to bg-white, light gray border, and dark text
		<Card
			className={`bg-white border-zinc-200 text-zinc-950 ${className || ""}`}
		>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				{/* Changed text-zinc-400 to text-zinc-500 for better contrast on white */}
				<CardTitle className="text-sm font-medium text-zinc-500">
					{title}
				</CardTitle>
				<Icon className="h-4 w-4 text-zinc-500" />
			</CardHeader>
			<CardContent>
				<div className="text-3xl font-bold tracking-tight">{value}</div>
			</CardContent>
		</Card>
	);
}
