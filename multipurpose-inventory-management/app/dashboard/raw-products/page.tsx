"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Boxes, Package, PackagePlus, Tag } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
	type FieldErrors,
	type UseFormRegister,
	useForm,
} from "react-hook-form";
import { Modal } from "@/components/appComponents/Modal";
import { MetricCard } from "@/components/appComponents/metric-card";
import DataTable, { type PaginationParams } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGetCategories } from "@/hooks/useCategories";
import {
	type RawProduct,
	useCreateRawProduct,
	useDeleteRawProduct,
	useGetRawProducts,
	useRawProductStockIn,
	useUpdateRawProduct,
} from "@/hooks/useRawProducts";
import { useGetSubCategories } from "@/hooks/useSubcategory";
import { useGetUnits } from "@/hooks/useUnits";
import {
	type CreateRawProductForm,
	createRawProductSchema,
	type RawProductStockInForm,
	rawProductStockInSchema,
} from "@/validation/rawProduct.schema";
import { getRawProductColumns } from "./columns";

type CategoryOption = { id: string; name: string };
type SubCategoryOption = { id: string; name: string; categoryId: string };
type UnitOption = { id: string; name: string; symbol: string };

type RawProductFormFieldsProps = {
	register: UseFormRegister<CreateRawProductForm>;
	errors: FieldErrors<CreateRawProductForm>;
	isPending: boolean;
	onClose: () => void;
	categoryOptions: CategoryOption[];
	subCategoryOptions: SubCategoryOption[];
	unitOptions: UnitOption[];
	watchedCategoryId: string;
};

function RawProductFormFields({
	register,
	errors,
	isPending,
	onClose,
	categoryOptions,
	subCategoryOptions,
	unitOptions,
	watchedCategoryId,
}: RawProductFormFieldsProps) {
	const filteredSubCategories = subCategoryOptions.filter(
		(sub) => sub.categoryId === watchedCategoryId,
	);

	return (
		<div className="space-y-5 p-6">
			<div className="grid grid-cols-2 gap-4">
				<Field>
					<FieldLabel htmlFor="name">Name</FieldLabel>
					<Input
						id="name"
						placeholder="e.g., Wheat Flour"
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

			<Field>
				<FieldLabel htmlFor="categoryId">Category</FieldLabel>
				<select
					id="categoryId"
					className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					{...register("categoryId")}
				>
					<option value="">Select a category...</option>
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
				<FieldLabel htmlFor="subCategoryId">
					Subcategory{" "}
					{!watchedCategoryId && (
						<span className="text-xs text-muted-foreground font-normal">
							(select a category first)
						</span>
					)}
				</FieldLabel>
				<select
					id="subCategoryId"
					disabled={!watchedCategoryId || filteredSubCategories.length === 0}
					className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
					{...register("subCategoryId")}
				>
					<option value="">
						{!watchedCategoryId
							? "Select a category first..."
							: filteredSubCategories.length === 0
								? "No subcategories available"
								: "Select a subcategory..."}
					</option>
					{filteredSubCategories.map((sub) => (
						<option key={sub.id} value={sub.id}>
							{sub.name}
						</option>
					))}
				</select>
			</Field>

			<Field>
				<FieldLabel htmlFor="lowStockAlert">Low Stock Alert</FieldLabel>
				<Input
					id="lowStockAlert"
					type="number"
					placeholder="e.g., 10"
					{...register("lowStockAlert")}
				/>
			</Field>

			<Field>
				<FieldLabel htmlFor="description">Description</FieldLabel>
				<Textarea
					id="description"
					placeholder="Describe the raw material..."
					rows={3}
					{...register("description")}
				/>
			</Field>

			<div className="flex justify-end gap-3 pt-2">
				<Button type="button" variant="ghost" onClick={onClose}>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? "Saving..." : "Save"}
				</Button>
			</div>
		</div>
	);
}

type StockInFormProps = {
	rawProduct: RawProduct;
	onClose: () => void;
};

function StockInForm({ rawProduct, onClose }: StockInFormProps) {
	const { mutate: stockIn, isPending } = useRawProductStockIn(rawProduct.id);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RawProductStockInForm>({
		resolver: zodResolver(rawProductStockInSchema),
		defaultValues: { quantity: 0, totalCost: 0 },
	});

	const onSubmit = (values: RawProductStockInForm) => {
		stockIn(
			{
				...values,
				batch: values.batch || undefined,
			},
			{ onSuccess: onClose },
		);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
			<div className="p-3 bg-muted/30 rounded-md text-sm flex justify-between">
				<span className="text-muted-foreground">Current Stock</span>
				<span className="font-semibold">
					{Number(rawProduct.currentStock ?? rawProduct.totalStock ?? 0)}{" "}
					{rawProduct.unit?.symbol}
				</span>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<Field>
					<FieldLabel htmlFor="quantity">
						Quantity ({rawProduct.unit?.symbol})
					</FieldLabel>
					<Input
						id="quantity"
						type="number"
						step="0.01"
						min={0}
						{...register("quantity")}
					/>
					{errors.quantity && (
						<FieldError>{errors.quantity.message}</FieldError>
					)}
				</Field>

				<Field>
					<FieldLabel htmlFor="totalCost">Total Cost</FieldLabel>
					<Input
						id="totalCost"
						type="number"
						step="0.01"
						placeholder="0.00"
						{...register("totalCost")}
					/>
				</Field>
			</div>

			<Field>
				<FieldLabel htmlFor="batch">Batch / Lot</FieldLabel>
				<Input
					id="batch"
					placeholder="e.g., BATCH-001"
					{...register("batch")}
				/>
			</Field>

			{/* Supplier field removed */}

			<div className="flex justify-end gap-3 pt-2">
				<Button type="button" variant="ghost" onClick={onClose}>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? "Adding..." : "Add Stock"}
				</Button>
			</div>
		</form>
	);
}

export default function RawProductsPage() {
	const [createOpen, setCreateOpen] = useState(false);
	const [editRawProduct, setEditRawProduct] = useState<RawProduct | null>(null);
	const [stockInRawProduct, setStockInRawProduct] = useState<RawProduct | null>(
		null,
	);
	const [tableParams, setTableParams] = useState<PaginationParams>({
		page: 1,
		pageSize: 10,
	});

	const { data: result, isLoading } = useGetRawProducts(tableParams);
	const rawProducts = result?.data ?? [];
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

	const { mutate: createRawProduct, isPending: isCreating } =
		useCreateRawProduct();
	const { mutate: updateRawProduct, isPending: isUpdating } =
		useUpdateRawProduct();
	const { mutate: deleteRawProduct } = useDeleteRawProduct();

	const createForm = useForm<CreateRawProductForm>({
		resolver: zodResolver(createRawProductSchema),
		defaultValues: {
			name: "",
			unitId: "",
			description: "",
			categoryId: "",
			subCategoryId: "",
			lowStockAlert: "",
		},
	});

	const editForm = useForm<CreateRawProductForm>({
		resolver: zodResolver(createRawProductSchema),
		defaultValues: {
			name: "",
			unitId: "",
			description: "",
			categoryId: "",
			subCategoryId: "",
			lowStockAlert: "",
		},
	});

	const watchedCreateCategoryId = createForm.watch("categoryId") ?? "";
	const watchedEditCategoryId = editForm.watch("categoryId") ?? "";

	const openEdit = useCallback(
		(rawProduct: RawProduct) => {
			setEditRawProduct(rawProduct);
			editForm.reset({
				name: rawProduct.name,
				unitId: rawProduct.unitId,
				description: rawProduct.description ?? "",
				categoryId: rawProduct.categoryId,
				subCategoryId: rawProduct.subCategoryId ?? "",
				lowStockAlert: rawProduct.lowStockAlert ?? "",
			});
		},
		[editForm],
	);

	const onCreateSubmit = (values: CreateRawProductForm) => {
		const cleaned = {
			...values,
			subCategoryId: values.subCategoryId || undefined,
			lowStockAlert: values.lowStockAlert || undefined,
			description: values.description || undefined,
			img: values.img || undefined,
		};
		createRawProduct(cleaned, {
			onSuccess: () => {
				createForm.reset();
				setCreateOpen(false);
			},
		});
	};

	const onEditSubmit = (values: CreateRawProductForm) => {
		if (!editRawProduct) return;
		updateRawProduct(
			{ id: editRawProduct.id, ...values },
			{
				onSuccess: () => {
					editForm.reset();
					setEditRawProduct(null);
				},
			},
		);
	};

	const lowStockCount = rawProducts.filter((rp) => {
		const alert = rp.lowStockAlert ? Number(rp.lowStockAlert) : null;
		return (
			alert !== null && Number(rp.currentStock ?? rp.totalStock ?? 0) <= alert
		);
	}).length;

	const columns = useMemo(
		() =>
			getRawProductColumns({
				onEdit: openEdit,
				onDelete: (id) => {
					if (confirm("Are you sure you want to delete this raw product?")) {
						deleteRawProduct(id);
					}
				},
				onStockIn: (rp) => setStockInRawProduct(rp),
			}),
		[deleteRawProduct, openEdit],
	);

	return (
		<div className="container mx-auto p-6 space-y-4">
			<div className="grid gap-4 md:grid-cols-4">
				<MetricCard
					title="Total Raw Products"
					value={totalCount.toString()}
					icon={Package}
				/>
				<MetricCard
					title="Low Stock"
					value={lowStockCount.toString()}
					icon={PackagePlus}
				/>
				<MetricCard
					title="Categories"
					value={categoryOptions.length.toString()}
					icon={Tag}
				/>
				<MetricCard
					title="Units"
					value={unitOptions.length.toString()}
					icon={Boxes}
				/>
			</div>

			<Modal
				open={createOpen}
				onOpenChange={setCreateOpen}
				trigger={<Button>+ New Raw Product</Button>}
				title="Create Raw Product"
			>
				<form onSubmit={createForm.handleSubmit(onCreateSubmit)}>
					<RawProductFormFields
						register={createForm.register}
						errors={createForm.formState.errors}
						isPending={isCreating}
						onClose={() => setCreateOpen(false)}
						categoryOptions={categoryOptions}
						subCategoryOptions={subCategoryOptions}
						unitOptions={unitOptions}
						watchedCategoryId={watchedCreateCategoryId}
					/>
				</form>
			</Modal>
			{/* stock button  */}
			<Link href="/dashboard/raw-products/stocks">
				<Button>Stock</Button>
			</Link>
			<Modal
				open={!!editRawProduct}
				onOpenChange={(open) => !open && setEditRawProduct(null)}
				title="Edit Raw Product"
			>
				<form onSubmit={editForm.handleSubmit(onEditSubmit)}>
					<RawProductFormFields
						register={editForm.register}
						errors={editForm.formState.errors}
						isPending={isUpdating}
						onClose={() => setEditRawProduct(null)}
						categoryOptions={categoryOptions}
						subCategoryOptions={subCategoryOptions}
						unitOptions={unitOptions}
						watchedCategoryId={watchedEditCategoryId}
					/>
				</form>
			</Modal>

			<Modal
				open={!!stockInRawProduct}
				onOpenChange={(open) => !open && setStockInRawProduct(null)}
				title="Stock In"
			>
				{stockInRawProduct && (
					<StockInForm
						key={stockInRawProduct.id}
						rawProduct={stockInRawProduct}
						onClose={() => setStockInRawProduct(null)}
					/>
				)}
			</Modal>

			<DataTable
				title="Raw Products"
				columns={columns}
				data={rawProducts}
				totalCount={totalCount}
				currentPage={tableParams.page}
				pageSize={tableParams.pageSize}
				onPaginationChange={setTableParams}
				loading={isLoading}
				searchPlaceholder="Search raw products..."
			/>
		</div>
	);
}
