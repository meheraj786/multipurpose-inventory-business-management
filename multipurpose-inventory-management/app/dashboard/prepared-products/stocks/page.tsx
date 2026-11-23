"use client";

import { ChefHat, DollarSign, Package, TrendingUp } from "lucide-react";
import { useState } from "react";
import { MetricCard } from "@/components/appComponents/metric-card";
import DataTable, { type PaginationParams } from "@/components/data-table";
import { useCurrency } from "@/hooks/useCurrency";
import { useGetPreparedProducts } from "@/hooks/usePreparedProducts";
import type { PreparedProduct } from "@/lib/api/services/preparedProduct.service";
import { getPreparedProductStockColumns } from "./columns";
import { ProduceDialog } from "./ProduceDialog";

export default function PreparedProductStockPage() {
	const { symbol } = useCurrency();
	const [tableParams, setTableParams] = useState<PaginationParams>({
		page: 1,
		pageSize: 10,
	});
	const [produceTarget, setProduceTarget] = useState<PreparedProduct | null>(
		null,
	);

	const { data: result, isLoading } = useGetPreparedProducts(tableParams);
	const items = result?.data ?? [];
	const totalCount = result?.meta.total ?? 0;

	const totalCurrentStock = items.reduce(
		(sum, p) => sum + (p.totalStock ?? 0),
		0,
	);
	const totalStockValue = items.reduce(
		(sum, p) => sum + (p.totalStock ?? 0) * Number(p.defaultSalePrice ?? 0),
		0,
	);

	const columns = getPreparedProductStockColumns({
		onProduce: (item) => setProduceTarget(item),
	});

	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-4">
				<MetricCard
					title="Total Menu Items"
					value={totalCount.toString()}
					icon={ChefHat}
				/>
				<MetricCard
					title="Current Stock"
					value={`${totalCurrentStock} units`}
					icon={Package}
				/>
				<MetricCard
					title="Stock Value"
					value={`${symbol}${totalStockValue.toFixed(2)}`}
					icon={DollarSign}
				/>
				<MetricCard
					title="Avg Price"
					value={`${symbol}${(items.length ? totalStockValue / items.length : 0).toFixed(2)}`}
					icon={TrendingUp}
				/>
			</div>

			<DataTable
				title="Prepared Product Stock"
				columns={columns}
				data={items}
				totalCount={totalCount}
				currentPage={tableParams.page}
				pageSize={tableParams.pageSize}
				onPaginationChange={setTableParams}
				loading={isLoading}
				searchPlaceholder="Search menu items..."
			/>

			{produceTarget && (
				<ProduceDialog
					preparedProduct={produceTarget}
					onClose={() => setProduceTarget(null)}
				/>
			)}
		</div>
	);
}
