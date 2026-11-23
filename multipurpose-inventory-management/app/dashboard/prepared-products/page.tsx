"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Boxes, DollarSign, Package, Plus, Trash2, Zap } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Modal } from "@/components/appComponents/Modal";
import { MetricCard } from "@/components/appComponents/metric-card";
import DataTable, { type PaginationParams } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGetCategories } from "@/hooks/useCategories";
import { useCurrency } from "@/hooks/useCurrency";
import {
	type PreparedProduct,
	type PreparedProductItem,
	useCreatePreparedProduct,
	useDeletePreparedProduct,
	useGetPreparedProducts,
	useProduceStock,
	useUpdatePreparedProduct,
} from "@/hooks/usePreparedProducts";
import { useGetRawProducts } from "@/hooks/useRawProducts";
import { useGetSubCategories } from "@/hooks/useSubcategory";
import { useGetUnits } from "@/hooks/useUnits";
import {
	type CreatePreparedProductForm,
	createPreparedProductSchema,
	type ProduceStockForm,
	produceStockSchema,
} from "@/validation/preparedProduct.schema";
import { getPreparedProductColumns } from "./columns";

type PreparedProductWithItems = PreparedProduct & {
	preparedProductItems?: PreparedProductItem[];
};

function PreparedProductForm({
	defaultValues,
	isPending,
	onSubmit,
	onClose,
	categoryOptions,
	subCategoryOptions,
	unitOptions,
	rawProductOptions,
	watchedCategoryId,
}: {
	defaultValues: Partial<CreatePreparedProductForm>;
	isPending: boolean;
	onSubmit: (values: CreatePreparedProductForm) => void;
	onClose: () => void;
	categoryOptions: { id: string; name: string }[];
	subCategoryOptions: { id: string; name: string; categoryId: string }[];
	unitOptions: { id: string; name: string; symbol: string }[];
	rawProductOptions: {
		id: string;
		name: string;
		unit: { symbol: string };
		currentStock: number;
	}[];
	watchedCategoryId: string;
}) {
	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<CreatePreparedProductForm>({
		resolver: zodResolver(createPreparedProductSchema),
		defaultValues: {
			items: [{ rawProductId: "", quantity: 1, unit: "" }],
			...defaultValues,
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "items",
	});

	const filteredSubCategories = subCategoryOptions.filter(
		(sub) => sub.categoryId === watchedCategoryId,
	);

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-5 p-6 max-h-[80vh] overflow-y-auto"
		>
			<div className="grid grid-cols-2 gap-4">
				<Field>
					<FieldLabel htmlFor="name">Name</FieldLabel>
					<Input
						id="name"
						placeholder="e.g., Chocolate Cake"
						{...register("name")}
					/>
					{errors.name && <FieldError>{errors.name.message}</FieldError>}
				</Field>

				<Field>
					<FieldLabel htmlFor="unitId">Unit</FieldLabel>
					<select
						id="unitId"
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						{...register("unitId")}
					>
						<option value="">Select unit...</option>
						{unitOptions.map((u) => (
							<option key={u.id} value={u.id}>
								{u.name} ({u.symbol})
							</option>
						))}
					</select>
					{errors.unitId && <FieldError>{errors.unitId.message}</FieldError>}
				</Field>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<Field>
					<FieldLabel htmlFor="categoryId">Category</FieldLabel>
					<select
						id="categoryId"
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						{...register("categoryId")}
					>
						<option value="">Select category...</option>
						{categoryOptions.map((cat) => (
							<option key={cat.id} value={cat.id}>
								{cat.name}
							</option>
						))}
					</select>
					{errors.categoryId && (
						<FieldError>{errors.categoryId.message}</FieldError>
					)}
				</Field>

				<Field>
					<FieldLabel htmlFor="subCategoryId">Subcategory</FieldLabel>
					<select
						id="subCategoryId"
						disabled={!watchedCategoryId || filteredSubCategories.length === 0}
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
						{...register("subCategoryId")}
					>
						<option value="">
							{!watchedCategoryId
								? "Select category first..."
								: "Select subcategory..."}
						</option>
						{filteredSubCategories.map((sub) => (
							<option key={sub.id} value={sub.id}>
								{sub.name}
							</option>
						))}
					</select>
				</Field>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<Field>
					<FieldLabel htmlFor="rawMaterialCost">
						Additional Cost (Optional)
					</FieldLabel>
					<Input
						id="rawMaterialCost"
						type="number"
						step="0.01"
						placeholder="0.00"
						{...register("rawMaterialCost")}
					/>
				</Field>

				<Field>
					<FieldLabel htmlFor="defaultSalePrice">Sale Price</FieldLabel>
					<Input
						id="defaultSalePrice"
						type="number"
						step="0.01"
						placeholder="0.00"
						{...register("defaultSalePrice")}
					/>
				</Field>
			</div>

			<Field>
				<FieldLabel htmlFor="description">Description</FieldLabel>
				<Textarea
					id="description"
					placeholder="Describe the prepared product..."
					rows={2}
					{...register("description")}
				/>
			</Field>

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h3 className="font-medium text-sm">Recipe / Ingredients</h3>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => append({ rawProductId: "", quantity: 1, unit: "" })}
					>
						<Plus className="h-3 w-3 mr-1" />
						Add Ingredient
					</Button>
				</div>

				{fields.length === 0 && (
					<p className="text-xs text-muted-foreground text-center py-3 border rounded-md border-dashed">
						Add at least one ingredient
					</p>
				)}

				{fields.map((field, index) => (
					<div
						key={field.id}
						className="grid grid-cols-12 gap-2 items-end p-3 border rounded-md"
					>
						<div className="col-span-5">
							<FieldLabel className="text-xs">Raw Product</FieldLabel>
							<select
								className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								{...register(`items.${index}.rawProductId`)}
							>
								<option value="">Select...</option>
								{rawProductOptions.map((rp) => (
									<option key={rp.id} value={rp.id}>
										{rp.name} ({rp.currentStock} {rp.unit?.symbol} available)
									</option>
								))}
							</select>
							{errors.items?.[index]?.rawProductId && (
								<FieldError>
									{errors.items[index]?.rawProductId?.message}
								</FieldError>
							)}
						</div>

						<div className="col-span-3">
							<FieldLabel className="text-xs">Quantity</FieldLabel>
							<Input
								type="number"
								step="0.01"
								min={0}
								className="h-9"
								{...register(`items.${index}.quantity`)}
							/>
						</div>

						<div className="col-span-3">
							<FieldLabel className="text-xs">Unit</FieldLabel>
							<select
								className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								{...register(`items.${index}.unit`)}
							>
								<option value="">Select...</option>
								{unitOptions.map((u) => (
									<option key={u.id} value={u.symbol}>
										{u.symbol}
									</option>
								))}
							</select>
						</div>

						<div className="col-span-1 flex justify-end">
							<Button
								type="button"
								variant="ghost"
								size="icon"
								disabled={fields.length === 1}
								onClick={() => remove(index)}
							>
								<Trash2 className="h-4 w-4 text-destructive" />
							</Button>
						</div>
					</div>
				))}

				{errors.items?.root && (
					<FieldError>{errors.items.root.message}</FieldError>
				)}
			</div>

			<div className="flex justify-end gap-3 pt-2">
				<Button type="button" variant="ghost" onClick={onClose}>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? "Saving..." : "Save"}
				</Button>
			</div>
		</form>
	);
}

function ProduceStockModal({
	preparedProduct,
	onClose,
}: {
	preparedProduct: PreparedProductWithItems;
	onClose: () => void;
}) {
	const { mutate: produceStock, isPending } = useProduceStock(
		preparedProduct.id,
	);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ProduceStockForm>({
		resolver: zodResolver(produceStockSchema),
		defaultValues: { quantity: 1 },
	});

	const onSubmit = (values: ProduceStockForm) => {
		produceStock(values.quantity, { onSuccess: onClose });
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
			<div className="p-3 bg-muted/30 rounded-md text-sm space-y-2">
				<div className="flex justify-between">
					<span className="text-muted-foreground">Product</span>
					<span className="font-medium">{preparedProduct.name}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">Current Stock</span>
					<span className="font-medium">
						{preparedProduct.totalStock ?? 0} {preparedProduct.unit?.symbol}
					</span>
				</div>
			</div>

			{preparedProduct.preparedProductItems &&
				preparedProduct.preparedProductItems.length > 0 && (
					<div className="space-y-2">
						<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
							Required Per Unit
						</p>
						{preparedProduct.preparedProductItems.map((item) => (
							<div
								key={item.id}
								className="flex justify-between text-sm px-2 py-1 rounded bg-muted/30"
							>
								<span>{item.rawProduct.name}</span>
								<span className="text-muted-foreground">
									{Number(item.quantity)} {item.unit} (available:{" "}
									{Number(item.rawProduct.totalStock)}{" "}
									{item.rawProduct.unit?.symbol})
								</span>
							</div>
						))}
					</div>
				)}

			<Field>
				<FieldLabel htmlFor="quantity">
					Quantity to Produce ({preparedProduct.unit?.symbol})
				</FieldLabel>
				<Input
					id="quantity"
					type="number"
					step="0.01"
					min={0.01}
					{...register("quantity")}
				/>
				{errors.quantity && <FieldError>{errors.quantity.message}</FieldError>}
			</Field>

			<div className="flex justify-end gap-3 pt-2">
				<Button type="button" variant="ghost" onClick={onClose}>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? "Producing..." : "Produce"}
				</Button>
			</div>
		</form>
	);
}

export default function PreparedProductsPage() {
	const [createOpen, setCreateOpen] = useState(false);
	const [editPP, setEditPP] = useState<PreparedProductWithItems | null>(null);
	const [producePP, setProducePP] = useState<PreparedProductWithItems | null>(
		null,
	);
	const [tableParams, setTableParams] = useState<PaginationParams>({
		page: 1,
		pageSize: 10,
	});
	const { symbol } = useCurrency();
	const { data: result, isLoading } = useGetPreparedProducts(tableParams);
	const preparedProducts = result?.data ?? [];
	const totalCount = result?.meta.total ?? 0;

	const { data: catResult } = useGetCategories({ page: 1, pageSize: 100 });
	const categoryOptions = catResult?.data ?? [];

	const { data: subCatResult } = useGetSubCategories({
		page: 1,
		pageSize: 100,
	});
	const subCategoryOptions = subCatResult?.data ?? [];

	const { data: units } = useGetUnits();
	const unitOptions = units?.data ?? [];

	const { data: rawProductResult } = useGetRawProducts({
		page: 1,
		pageSize: 100,
	});
	const rawProductOptions = (rawProductResult?.data ?? []).map((rp) => ({
		id: rp.id,
		name: rp.name,
		unit: rp.unit,
		currentStock: Number(rp.currentStock ?? rp.totalStock ?? 0),
	}));

	const { mutate: createPP, isPending: isCreating } =
		useCreatePreparedProduct();
	const { mutate: updatePP, isPending: isUpdating } =
		useUpdatePreparedProduct();
	const { mutate: deletePP } = useDeletePreparedProduct();

	const [createCategoryId, setCreateCategoryId] = useState("");
	const [editCategoryId, setEditCategoryId] = useState("");

	// Ref-based handlers to keep column memoization stable
	const handlersRef = useRef({
		onEdit: (pp: PreparedProduct) => {
			setEditPP(pp as PreparedProductWithItems);
			setEditCategoryId(pp.categoryId);
		},
		onProduce: (pp: PreparedProduct) => {
			setProducePP(pp as PreparedProductWithItems);
		},
	});

	handlersRef.current = {
		onEdit: (pp: PreparedProduct) => {
			setEditPP(pp as PreparedProductWithItems);
			setEditCategoryId(pp.categoryId);
		},
		onProduce: (pp: PreparedProduct) => {
			setProducePP(pp as PreparedProductWithItems);
		},
	};

	const totalStockValue = preparedProducts.reduce(
		(sum, pp) => sum + (pp.totalStock ?? 0) * Number(pp.defaultSalePrice ?? 0),
		0,
	);

	const columns = useMemo(
		() =>
			getPreparedProductColumns({
				onEdit: (pp: PreparedProduct) => handlersRef.current.onEdit(pp),
				onDelete: (id) => {
					if (
						confirm("Are you sure you want to delete this prepared product?")
					) {
						deletePP(id);
					}
				},
				onProduce: (pp: PreparedProduct) => handlersRef.current.onProduce(pp),
			}),
		[deletePP],
	);

	return (
		<div className="container mx-auto p-6 space-y-4">
			<div className="grid gap-4 md:grid-cols-4">
				<MetricCard
					title="Total Products"
					value={totalCount.toString()}
					icon={Package}
				/>
				<MetricCard
					title="Stock Value"
					value={`${symbol}${totalStockValue.toFixed(2)}`}
					icon={DollarSign}
				/>
				<MetricCard
					title="Categories"
					value={categoryOptions.length.toString()}
					icon={Boxes}
				/>
				<MetricCard
					title="Raw Materials"
					value={rawProductOptions.length.toString()}
					icon={Zap}
				/>
			</div>

			<Modal
				open={createOpen}
				onOpenChange={(open) => {
					setCreateOpen(open);
					if (!open) setCreateCategoryId("");
				}}
				trigger={<Button>+ New Prepared Product</Button>}
				title="Create Prepared Product"
			>
				<PreparedProductForm
					key="create"
					defaultValues={{
						categoryId: "",
						items: [{ rawProductId: "", quantity: 1, unit: "" }],
					}}
					isPending={isCreating}
					onSubmit={(values) =>
						createPP(values, { onSuccess: () => setCreateOpen(false) })
					}
					onClose={() => setCreateOpen(false)}
					categoryOptions={categoryOptions}
					subCategoryOptions={subCategoryOptions}
					unitOptions={unitOptions}
					rawProductOptions={rawProductOptions}
					watchedCategoryId={createCategoryId}
				/>
			</Modal>
			{/* stock button  */}
			<Link href="/dashboard/prepared-products/stocks">
				<Button>Stock</Button>
			</Link>
			<Modal
				open={!!editPP}
				onOpenChange={(open) => {
					if (!open) {
						setEditPP(null);
						setEditCategoryId("");
					}
				}}
				title="Edit Prepared Product"
			>
				{editPP && (
					<PreparedProductForm
						key={editPP.id}
						defaultValues={{
							name: editPP.name,
							unitId: editPP.unitId,
							categoryId: editPP.categoryId,
							subCategoryId: editPP.subCategoryId ?? "",
							rawMaterialCost: editPP.rawMaterialCost ?? 0,
							defaultSalePrice: editPP.defaultSalePrice ?? 0,
							description: editPP.description ?? "",
							items: editPP.preparedProductItems?.map((item) => ({
								rawProductId: item.rawProductId,
								quantity: Number(item.quantity),
								unit: item.unit,
							})) ?? [{ rawProductId: "", quantity: 1, unit: "" }],
						}}
						isPending={isUpdating}
						onSubmit={(values) =>
							updatePP(
								{ id: editPP.id, ...values },
								{ onSuccess: () => setEditPP(null) },
							)
						}
						onClose={() => setEditPP(null)}
						categoryOptions={categoryOptions}
						subCategoryOptions={subCategoryOptions}
						unitOptions={unitOptions}
						rawProductOptions={rawProductOptions}
						watchedCategoryId={editCategoryId}
					/>
				)}
			</Modal>

			<Modal
				open={!!producePP}
				onOpenChange={(open) => !open && setProducePP(null)}
				title="Produce Stock"
			>
				{producePP && (
					<ProduceStockModal
						key={producePP.id}
						preparedProduct={producePP}
						onClose={() => setProducePP(null)}
					/>
				)}
			</Modal>

			<DataTable
				title="Prepared Products"
				columns={columns}
				data={preparedProducts}
				totalCount={totalCount}
				currentPage={tableParams.page}
				pageSize={tableParams.pageSize}
				onPaginationChange={setTableParams}
				loading={isLoading}
				searchPlaceholder="Search prepared products..."
			/>
		</div>
	);
}
