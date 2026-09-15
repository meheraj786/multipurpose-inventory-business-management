"use client";

import { AlertTriangle, Boxes, Layers, Package } from "lucide-react";
import { useState } from "react";
import { MetricCard } from "@/components/appComponents/metric-card";
import DataTable, { type PaginationParams } from "@/components/data-table";
import { useGetRawProducts } from "@/hooks/useRawProducts";
import type { RawProduct } from "@/lib/api/services/rawProduct.service";
import { getRawProductStockColumns } from "./columns";
import { StockInDialog } from "./StockInDialog";

export default function RawProductStockPage() {
	const [tableParams, setTableParams] = useState<PaginationParams>({
		page: 1,
		pageSize: 10,
	});
	const [stockTarget, setStockTarget] = useState<RawProduct | null>(null);

	const { data: result, isLoading } = useGetRawProducts(tableParams);
	const products = result?.data ?? [];
	const totalCount = result?.meta.total ?? 0;

	const totalStock = products.reduce(
		(sum, p) => sum + (p.currentStock ?? p.totalStock ?? 0),
		0,
	);

	const lowStockCount = products.filter((p) => {
		const stock = p.currentStock ?? p.totalStock ?? 0;
		const alert = p.lowStockAlert ? Number(p.lowStockAlert) : null;
		return alert !== null && stock <= alert;
	}).length;

	const uniqueCategories = new Set(
		products.map((p) => p.category?.id).filter(Boolean),
	).size;

	const columns = getRawProductStockColumns({
		onAddStock: (product) => setStockTarget(product),
	});

	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-4">
				<MetricCard
					title="Total Raw Products"
					value={totalCount.toString()}
					icon={Boxes}
				/>
				<MetricCard
					title="Total Stock"
					value={`${totalStock} units`}
					icon={Package}
				/>
				<MetricCard
					title="Low Stock"
					value={lowStockCount.toString()}
					icon={AlertTriangle}
				/>
				<MetricCard
					title="Categories"
					value={uniqueCategories.toString()}
					icon={Layers}
				/>
			</div>

			<DataTable
				title="Raw Product Stock"
				columns={columns}
				data={products}
				totalCount={totalCount}
				currentPage={tableParams.page}
				pageSize={tableParams.pageSize}
				onPaginationChange={setTableParams}
				loading={isLoading}
				searchPlaceholder="Search raw products..."
			/>

			{stockTarget && (
				<StockInDialog
					rawProduct={stockTarget}
					onClose={() => setStockTarget(null)}
				/>
			)}
		</div>
	);
}
