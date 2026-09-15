"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
	Activity,
	Layers,
	Package,
	Plus,
	Search,
	Tag,
	Trash2,
	X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Modal } from "@/components/appComponents/Modal";
import { MetricCard } from "@/components/appComponents/metric-card";
import DataTable, { type PaginationParams } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { Textarea } from "@/components/ui/textarea";
import { useGetPreparedProducts } from "@/hooks/usePreparedProducts";
import { useGetProducts } from "@/hooks/useProducts";
import { useGetRawProducts } from "@/hooks/useRawProducts";
import {
	useCreateWastage,
	useDeleteWastage,
	useGetAllWastages,
} from "@/hooks/useWastage";
import {
	isModuleAllowedForModel,
	type SystemModule,
	useBusinessModel,
} from "@/lib/business-model";
import {
	type CreateWastageInput,
	createWastageSchema,
	type WastageDetail,
} from "@/validation/wastage.schema";

type AssetType = "PRODUCT" | "RAW_PRODUCT" | "PREPARED_PRODUCT";

type AssetTypeConfig = {
	type: AssetType;
	module: SystemModule;
	label: string;
	icon: typeof Package;
};

const ASSET_TYPE_CONFIG: AssetTypeConfig[] = [
	{
		type: "PRODUCT",
		module: "PRODUCT",
		label: "Retail Product",
		icon: Package,
	},
	{
		type: "RAW_PRODUCT",
		module: "RAW_PRODUCT",
		label: "Raw Material",
		icon: Tag,
	},
	{
		type: "PREPARED_PRODUCT",
		module: "PREPARED_PRODUCT",
		label: "Prepared Batch",
		icon: Layers,
	},
];

export default function WastagePage() {
	const queryClient = useQueryClient();
	const businessModel = useBusinessModel();

	const allowedAssetTypes = useMemo(
		() =>
			ASSET_TYPE_CONFIG.filter((cfg) =>
				isModuleAllowedForModel(cfg.module, businessModel),
			),
		[businessModel],
	);

	const hasAnyStockableModule = allowedAssetTypes.length > 0;
	const canTrackRawMaterials = allowedAssetTypes.some(
		(t) => t.type === "RAW_PRODUCT",
	);
	const _canTrackPreparedProducts = allowedAssetTypes.some(
		(t) => t.type === "PREPARED_PRODUCT",
	);
	const canTrackRetailProducts = allowedAssetTypes.some(
		(t) => t.type === "PRODUCT",
	);

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [searchQuery, setSearchQuery] = useState("");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [assetType, setAssetType] = useState<AssetType | undefined>(undefined);

	useEffect(() => {
		if (allowedAssetTypes.length === 0) {
			setAssetType(undefined);
			return;
		}
		if (!assetType || !allowedAssetTypes.some((t) => t.type === assetType)) {
			setAssetType(allowedAssetTypes[0].type);
		}
	}, [allowedAssetTypes, assetType]);

	const { data: wastagesData, isLoading: isWastagesLoading } =
		useGetAllWastages(page, pageSize, searchQuery);

	const { data: productsData } = useGetProducts({ page: 1, pageSize: 500 });
	const { data: rawProductsData } = useGetRawProducts({
		page: 1,
		pageSize: 500,
	});
	const { data: preparedProductsData } = useGetPreparedProducts({
		page: 1,
		pageSize: 500,
	});

	const createWastageMutation = useCreateWastage();
	const deleteWastageMutation = useDeleteWastage();

	const form = useForm<CreateWastageInput>({
		resolver: zodResolver(createWastageSchema),
		defaultValues: {
			productId: undefined,
			rawProductId: undefined,
			preparedProductId: undefined,
			quantity: 1,
			reason: "",
			notes: "",
		},
	});

	const {
		register,
		handleSubmit,
		control,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = form;

	const selectedProductId = watch("productId");
	const selectedRawProductId = watch("rawProductId");
	const selectedPreparedProductId = watch("preparedProductId");

	const productsList = useMemo(() => productsData?.data || [], [productsData]);
	const rawProductsList = useMemo(
		() => rawProductsData?.data || [],
		[rawProductsData],
	);
	const preparedProductsList = useMemo(
		() => preparedProductsData?.data || [],
		[preparedProductsData],
	);

	const activeAssetStock = useMemo(() => {
		if (assetType === "PRODUCT" && selectedProductId) {
			const item = productsList.find((p) => p.id === selectedProductId);
			return item ? Number(item.totalStock ?? 0) : 0;
		}
		if (assetType === "RAW_PRODUCT" && selectedRawProductId) {
			const item = rawProductsList.find((p) => p.id === selectedRawProductId);
			return item ? Number(item.totalStock ?? 0) : 0;
		}
		if (assetType === "PREPARED_PRODUCT" && selectedPreparedProductId) {
			const item = preparedProductsList.find(
				(p) => p.id === selectedPreparedProductId,
			);
			return item ? Number(item.totalStock ?? 0) : 0;
		}
		return 0;
	}, [
		assetType,
		selectedProductId,
		selectedRawProductId,
		selectedPreparedProductId,
		productsList,
		rawProductsList,
		preparedProductsList,
	]);

	const handleAssetTypeChange = (type: AssetType) => {
		setAssetType(type);
		setValue("productId", undefined);
		setValue("rawProductId", undefined);
		setValue("preparedProductId", undefined);
	};

	const onSubmit = (values: CreateWastageInput) => {
		if (!assetType) return;

		const payload: CreateWastageInput = {
			quantity: values.quantity,
			reason: values.reason,
			notes: values.notes || "",
		};

		if (assetType === "PRODUCT") payload.productId = values.productId;
		if (assetType === "RAW_PRODUCT") payload.rawProductId = values.rawProductId;
		if (assetType === "PREPARED_PRODUCT")
			payload.preparedProductId = values.preparedProductId;

		createWastageMutation.mutate(payload, {
			onSuccess: () => {
				toast.success("Wastage record logged successfully");
				reset();
				setIsCreateOpen(false);
			},
			onError: (err) => {
				toast.error(err.message || "Failed to log wastage");
			},
		});
	};

	const handleDelete = (id: string) => {
		deleteWastageMutation.mutate(id, {
			onSuccess: () => {
				toast.success("Wastage record reversed and deleted");
				queryClient.invalidateQueries({ queryKey: ["wastages"] });
			},
			onError: (err) => {
				toast.error(err.message || "Failed to reverse wastage");
			},
		});
	};

	const columns = [
		{
			accessorKey: "assetName",
			header: "Asset Description",
			cell: ({ row }: { row: { original: WastageDetail } }) => {
				const data = row.original;
				const name =
					data.product?.name ??
					data.rawProduct?.name ??
					data.preparedProduct?.name ??
					"—";
				let badgeLabel = "PRODUCT";
				let badgeColor = "bg-neutral-100 text-neutral-800 border-neutral-200";

				if (data.rawProductId) {
					badgeLabel = "RAW MATERIAL";
					badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
				} else if (data.preparedProductId) {
					badgeLabel = "PREPARED BATCH";
					badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
				}

				return (
					<Link
						href={`/dashboard/${data.rawProductId ? `raw-products/${data.rawProductId}` : data.preparedProductId ? `prepared-products/${data.preparedProductId}` : data.productId ? `products/${data.productId}` : "products"}`}
						className="flex flex-col hover:underline"
					>
						<span className="font-semibold text-foreground">{name}</span>
						<div className="mt-1">
							<Badge
								className={`text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 ${badgeColor}`}
							>
								{badgeLabel}
							</Badge>
						</div>
					</Link>
				);
			},
		},
		{
			accessorKey: "quantity",
			header: "Quantity Lost",
			cell: ({ row }: { row: { original: WastageDetail } }) => (
				<span className="font-mono font-bold text-foreground">
					{row.original.quantity}
				</span>
			),
		},
		{
			accessorKey: "reason",
			header: "Reason / Category",
			cell: ({ row }: { row: { original: WastageDetail } }) => (
				<span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
					{row.original.reason}
				</span>
			),
		},
		{
			accessorKey: "createdAt",
			header: "Date Logged",
			cell: ({ row }: { row: { original: WastageDetail } }) => (
				<span className="text-xs text-muted-foreground font-medium">
					{new Date(row.original.createdAt).toLocaleString()}
				</span>
			),
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }: { row: { original: WastageDetail } }) => (
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
					onClick={() => handleDelete(row.original.id)}
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			),
		},
	];

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Wastage Logs</h1>
					<p className="text-sm text-muted-foreground mt-0.5">
						Track and audit adjustments for spoiled, damaged, or expired stock.
					</p>
				</div>
				<Button
					onClick={() => setIsCreateOpen(true)}
					className="gap-2"
					disabled={!hasAnyStockableModule}
				>
					<Plus className="h-4 w-4" /> Log Wastage Adjustment
				</Button>
			</div>

			<div
				className={`grid gap-4 sm:grid-cols-2 ${
					canTrackRawMaterials ? "lg:grid-cols-3" : "lg:grid-cols-2"
				}`}
			>
				<MetricCard
					title="Wastage Adjustments"
					value={wastagesData?.meta?.total ?? 0}
					icon={Activity}
				/>
				{canTrackRetailProducts && (
					<MetricCard
						title="Tracked Products"
						value={productsList.length}
						icon={Package}
					/>
				)}
				{canTrackRawMaterials && (
					<MetricCard
						title="Tracked Raw Materials"
						value={rawProductsList.length}
						icon={Tag}
					/>
				)}
			</div>

			<div className="flex items-center justify-between gap-4">
				<div className="relative max-w-sm w-full">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
					<Input
						placeholder="Search adjustments..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
					{searchQuery && (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					)}
				</div>
			</div>

			<DataTable
				columns={columns}
				data={wastagesData?.data || []}
				totalCount={wastagesData?.meta?.total ?? 0}
				currentPage={page}
				pageSize={pageSize}
				onPaginationChange={(params: PaginationParams) => {
					setPage(params.page);
					setPageSize(params.pageSize);
				}}
				loading={isWastagesLoading}
			/>

			<Modal
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
				title="Log Spoilage or Stock Damage"
			>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
					<div className="space-y-2">
						<Label>Select Asset Classification</Label>
						<div
							className="grid gap-2"
							style={{
								gridTemplateColumns: `repeat(${allowedAssetTypes.length || 1}, minmax(0, 1fr))`,
							}}
						>
							{allowedAssetTypes.map(({ type, label, icon: Icon }) => (
								<Button
									key={type}
									type="button"
									variant={assetType === type ? "default" : "outline"}
									onClick={() => handleAssetTypeChange(type)}
									className="h-10 text-xs gap-1.5"
								>
									<Icon className="h-4 w-4" /> {label}
								</Button>
							))}
						</div>
						{allowedAssetTypes.length === 0 && (
							<p className="text-xs text-muted-foreground">
								No stockable modules are enabled for this account&apos;s
								business model.
							</p>
						)}
					</div>

					{assetType === "PRODUCT" && (
						<div className="space-y-1.5">
							<Label>Select Product</Label>
							<Controller
								name="productId"
								control={control}
								render={({ field }) => (
									<SearchableCombobox
										value={field.value || ""}
										onChange={field.onChange}
										options={productsList.map((p) => ({
											value: p.id,
											label: p.name,
										}))}
										placeholder="Pick retail product"
										searchPlaceholder="Search product..."
										emptyText="No matching product found"
									/>
								)}
							/>
						</div>
					)}

					{assetType === "RAW_PRODUCT" && (
						<div className="space-y-1.5">
							<Label>Select Raw Material</Label>
							<Controller
								name="rawProductId"
								control={control}
								render={({ field }) => (
									<SearchableCombobox
										value={field.value || ""}
										onChange={field.onChange}
										options={rawProductsList.map((p) => ({
											value: p.id,
											label: p.name,
										}))}
										placeholder="Pick raw material"
										searchPlaceholder="Search material..."
										emptyText="No matching material found"
									/>
								)}
							/>
						</div>
					)}

					{assetType === "PREPARED_PRODUCT" && (
						<div className="space-y-1.5">
							<Label>Select Prepared Product</Label>
							<Controller
								name="preparedProductId"
								control={control}
								render={({ field }) => (
									<SearchableCombobox
										value={field.value || ""}
										onChange={field.onChange}
										options={preparedProductsList.map((p) => ({
											value: p.id,
											label: p.name,
										}))}
										placeholder="Pick prepared product batch"
										searchPlaceholder="Search batch..."
										emptyText="No matching batch found"
									/>
								)}
							/>
						</div>
					)}

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<Label htmlFor="quantity">Quantity to Adjust</Label>
							<Input
								id="quantity"
								type="number"
								step="0.0001"
								{...register("quantity", { valueAsNumber: true })}
								className={errors.quantity ? "border-destructive" : ""}
							/>
							{errors.quantity && (
								<p className="text-xs text-destructive">
									{errors.quantity.message}
								</p>
							)}
						</div>

						<div className="space-y-1.5">
							<Label>Current System Stock</Label>
							<div className="flex h-10 w-full items-center rounded-md border border-input bg-muted/30 px-3 py-2 text-sm font-semibold font-mono text-foreground select-none">
								{activeAssetStock}
							</div>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="reason">Adjustment Reason</Label>
						<Input
							id="reason"
							placeholder="e.g. Expired, Spoiled during prep, Damaged"
							{...register("reason")}
							className={errors.reason ? "border-destructive" : ""}
						/>
						{errors.reason && (
							<p className="text-xs text-destructive">
								{errors.reason.message}
							</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="notes">Additional Audit Notes</Label>
						<Textarea
							id="notes"
							rows={3}
							placeholder="Optional notes for further description..."
							{...register("notes")}
						/>
					</div>

					<div className="flex justify-end gap-3 pt-2 border-t">
						<Button
							type="button"
							variant="ghost"
							onClick={() => {
								reset();
								setIsCreateOpen(false);
							}}
							disabled={createWastageMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={createWastageMutation.isPending || !assetType}
						>
							{createWastageMutation.isPending
								? "Logging..."
								: "Commit Stock Out"}
						</Button>
					</div>
				</form>
			</Modal>
		</div>
	);
}
