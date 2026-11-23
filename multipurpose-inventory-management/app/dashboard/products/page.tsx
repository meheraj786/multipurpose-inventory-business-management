"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Package, PackageSearch, Plus, Tag, TrendingUp, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	type Control,
	Controller,
	type FieldErrors,
	type UseFormRegister,
	useForm,
	useWatch,
} from "react-hook-form";
import { Modal } from "@/components/appComponents/Modal";
import { MetricCard } from "@/components/appComponents/metric-card";
import DataTable, { type PaginationParams } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { Textarea } from "@/components/ui/textarea";
import { useGetCategories } from "@/hooks/useCategories";
import { useCurrency } from "@/hooks/useCurrency";
import { useModelGuard } from "@/hooks/useModelGuard";
import {
	type Product,
	useCreateProduct,
	useDeleteProduct,
	useGetProducts,
	useUpdateProduct,
} from "@/hooks/useProducts";
import { useGetSubCategories } from "@/hooks/useSubcategory";
import { useGetUnits } from "@/hooks/useUnits";
import {
	type CreateProductForm,
	type CreateProductInput,
	createProductSchema,
} from "@/validation/product.schema";
import { getProductColumns } from "./columns";

type CategoryOption = { id: string; name: string };
type SubCategoryOption = { id: string; name: string; categoryId: string };
type UnitOption = { id: string; name: string; symbol: string };

type ProductFormFieldsProps = {
	control: Control<CreateProductInput, unknown, CreateProductForm>;
	register: UseFormRegister<CreateProductInput>;
	errors: FieldErrors<CreateProductInput>;
	isPending: boolean;
	onClose: () => void;
	categoryOptions: CategoryOption[];
	subCategoryOptions: SubCategoryOption[];
	units: UnitOption[];
};

function FormRow({
	label,
	error,
	children,
}: {
	label: string;
	error?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1.5">
			<span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
				{label}
			</span>
			{children}
			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
}

function SectionHeader({ title }: { title: string }) {
	return (
		<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pb-2 border-b mb-4">
			{title}
		</p>
	);
}

function ProductFormFields({
	control,
	register,
	errors,
	isPending,
	onClose,
	categoryOptions,
	subCategoryOptions,
	units,
}: ProductFormFieldsProps) {
	const watchedCategoryId = useWatch({ control, name: "categoryId" });

	const filteredSubCategories = subCategoryOptions.filter(
		(sub) => sub.categoryId === watchedCategoryId,
	);

	return (
		<div className="p-6 space-y-6">
			<div>
				<SectionHeader title="Basic Info" />
				<div className="grid grid-cols-2 gap-4">
					<FormRow label="Product Name" error={errors.name?.message as string}>
						<Input placeholder="e.g. Apple" {...register("name")} />
					</FormRow>
					<FormRow label="SKU" error={errors.sku?.message as string}>
						<Input placeholder="e.g. APL-001" {...register("sku")} />
					</FormRow>
				</div>
			</div>

			<div>
				<SectionHeader title="Classification" />
				<div className="grid grid-cols-2 gap-4">
					<FormRow
						label="Category"
						error={errors.categoryId?.message as string}
					>
						<Controller
							name="categoryId"
							control={control}
							render={({ field }) => (
								<SearchableCombobox
									value={field.value || ""}
									onChange={field.onChange}
									options={categoryOptions.map((category) => ({
										value: category.id,
										label: category.name,
									}))}
									placeholder="Select category"
									searchPlaceholder="Search category..."
									emptyText="No category found."
									clearLabel="No category"
								/>
							)}
						/>
					</FormRow>

					<FormRow
						label="Subcategory"
						error={errors.subCategoryId?.message as string}
					>
						<Controller
							name="subCategoryId"
							control={control}
							render={({ field }) => (
								<SearchableCombobox
									value={field.value || ""}
									onChange={field.onChange}
									options={filteredSubCategories.map((subCategory) => ({
										value: subCategory.id,
										label: subCategory.name,
									}))}
									placeholder={
										watchedCategoryId
											? "Select subcategory"
											: "Pick category first"
									}
									searchPlaceholder="Search subcategory..."
									emptyText="No subcategory found."
									clearLabel="No subcategory"
									disabled={!watchedCategoryId}
								/>
							)}
						/>
					</FormRow>

					<FormRow label="Unit" error={errors.unitId?.message as string}>
						<Controller
							name="unitId"
							control={control}
							render={({ field }) => (
								<SearchableCombobox
									value={field.value || ""}
									onChange={field.onChange}
									options={units.map((unit) => ({
										value: unit.id,
										label: unit.name,
										description: unit.symbol,
										searchValue: `${unit.name} ${unit.symbol}`,
									}))}
									placeholder="Select unit"
									searchPlaceholder="Search unit..."
									emptyText="No unit found."
									clearLabel="No unit"
								/>
							)}
						/>
					</FormRow>

					<FormRow
						label="Low Stock Alert"
						error={errors.lowStockAlert?.message as string}
					>
						<Input
							type="number"
							placeholder="e.g. 10"
							{...register("lowStockAlert")}
						/>
					</FormRow>
				</div>
			</div>

			<div>
				<SectionHeader title="Pricing" />
				<div className="grid grid-cols-2 gap-4">
					<FormRow
						label="Sale Price"
						error={errors.defaultSalePrice?.message as string}
					>
						<Input
							type="number"
							step="0.01"
							placeholder="0.00"
							{...register("defaultSalePrice")}
						/>
					</FormRow>
					<FormRow label="Tax (%)" error={errors.tax?.message as string}>
						<Input
							type="number"
							step="0.01"
							placeholder="0"
							{...register("tax")}
						/>
					</FormRow>
				</div>
			</div>

			<div>
				<SectionHeader title="Additional" />
				<FormRow
					label="Description"
					error={errors.description?.message as string}
				>
					<Textarea
						placeholder="Optional product description..."
						rows={3}
						{...register("description")}
					/>
				</FormRow>
			</div>

			<div className="flex justify-end gap-3 pt-2 border-t">
				<Button
					type="button"
					variant="ghost"
					onClick={onClose}
					disabled={isPending}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? "Saving..." : "Save Product"}
				</Button>
			</div>
		</div>
	);
}

export default function ProductsPage() {
	useModelGuard("retail");

	const { data: categories } = useGetCategories();
	const { data: subCategories } = useGetSubCategories({
		page: 1,
		pageSize: 1000,
	});
	const { data: unitsResult } = useGetUnits();

	const categoryOptions: CategoryOption[] = (categories?.data || []).map(
		(c) => ({
			id: c.id,
			name: c.name,
		}),
	);

	const subCategoryOptions: SubCategoryOption[] = (
		subCategories?.data || []
	).map((s) => ({
		id: s.id,
		name: s.name,
		categoryId: s.categoryId,
	}));

	const units: UnitOption[] = unitsResult?.data || [];

	const [query, setQuery] = useState("");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const { symbol } = useCurrency();

	const { data: productsData, isLoading } = useGetProducts({
		page,
		pageSize,
		search: query,
	});

	const { mutateAsync: createProduct, isPending: isCreatePending } =
		useCreateProduct();
	const { mutateAsync: updateProduct, isPending: isUpdatePending } =
		useUpdateProduct();
	const { mutateAsync: deleteProduct } = useDeleteProduct();

	const createFormMethods = useForm<
		CreateProductInput,
		unknown,
		CreateProductForm
	>({
		resolver: zodResolver(createProductSchema),
		defaultValues: {
			name: "",
			categoryId: "",
			tax: undefined,
			defaultSalePrice: undefined,
			lowStockAlert: undefined,
		},
	});

	const editFormMethods = useForm<
		CreateProductInput,
		unknown,
		CreateProductForm
	>({
		resolver: zodResolver(createProductSchema),
	});

	useEffect(() => {
		if (editingProduct) {
			editFormMethods.reset({
				name: editingProduct.name,
				description: editingProduct.description || "",
				sku: editingProduct.sku || "",
				tax: editingProduct.tax || undefined,
				defaultSalePrice: editingProduct.defaultSalePrice || undefined,
				lowStockAlert: editingProduct.lowStockAlert || undefined,
				categoryId: editingProduct.categoryId,
				subCategoryId: editingProduct.subCategoryId || "",
				unitId: editingProduct.unitId || "",
				img: editingProduct.img || "",
			});
		}
	}, [editingProduct, editFormMethods]);

	const columns = useMemo(
		() =>
			getProductColumns(
				{ onEdit: setEditingProduct, onDelete: deleteProduct },
				symbol,
			),
		[deleteProduct, symbol],
	);

	const handleCreateSubmit = (values: CreateProductForm) => {
		const cleanedValues = {
			...values,
			subCategoryId:
				values.subCategoryId === "" ? undefined : values.subCategoryId,
			unitId: values.unitId === "" ? undefined : values.unitId,
		};
		createProduct(cleanedValues).then(() => {
			createFormMethods.reset();
			setIsCreateOpen(false);
		});
	};

	const handleEditSubmit = (values: CreateProductForm) => {
		if (!editingProduct) return;
		const cleanedValues = {
			...values,
			subCategoryId:
				values.subCategoryId === "" ? undefined : values.subCategoryId,
			unitId: values.unitId === "" ? undefined : values.unitId,
		};
		updateProduct({ id: editingProduct.id, ...cleanedValues }).then(() => {
			editFormMethods.reset();
			setEditingProduct(null);
		});
	};

	const handlePaginationChange = (params: PaginationParams) => {
		setPage(params.page);
		setPageSize(params.pageSize);
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="grid grid-cols-3 gap-4">
				<MetricCard
					title="Total Products"
					value={productsData?.meta?.total ?? 0}
					icon={Package}
				/>
				<MetricCard title="Low Stock" value={0} icon={TrendingUp} />
				<MetricCard
					title="Categories"
					value={categoryOptions.length}
					icon={Tag}
				/>
			</div>

			<div className="flex items-center justify-between gap-4">
				<div className="relative max-w-sm w-full">
					<PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
					<Input
						placeholder="Search products..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="pl-9"
					/>
					{query && (
						<button
							type="button"
							onClick={() => setQuery("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					)}
				</div>
				<Button onClick={() => setIsCreateOpen(true)}>
					<Plus className="h-4 w-4 mr-1.5" />
					Add Product
				</Button>
			</div>

			<DataTable
				columns={columns}
				data={productsData?.data || []}
				totalCount={productsData?.meta?.total ?? 0}
				currentPage={page}
				pageSize={pageSize}
				onPaginationChange={handlePaginationChange}
				loading={isLoading}
			/>

			<Modal
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
				title="Add New Product"
			>
				<form onSubmit={createFormMethods.handleSubmit(handleCreateSubmit)}>
					<ProductFormFields
						control={createFormMethods.control}
						register={createFormMethods.register}
						errors={createFormMethods.formState.errors}
						isPending={isCreatePending}
						onClose={() => setIsCreateOpen(false)}
						categoryOptions={categoryOptions}
						subCategoryOptions={subCategoryOptions}
						units={units}
					/>
				</form>
			</Modal>

			<Modal
				open={!!editingProduct}
				onOpenChange={(open) => !open && setEditingProduct(null)}
				title="Edit Product"
			>
				{editingProduct && (
					<form onSubmit={editFormMethods.handleSubmit(handleEditSubmit)}>
						<ProductFormFields
							control={editFormMethods.control}
							register={editFormMethods.register}
							errors={editFormMethods.formState.errors}
							isPending={isUpdatePending}
							onClose={() => setEditingProduct(null)}
							categoryOptions={categoryOptions}
							subCategoryOptions={subCategoryOptions}
							units={units}
						/>
					</form>
				)}
			</Modal>
		</div>
	);
}
