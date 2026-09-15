"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, ShoppingBag, Tag } from "lucide-react";
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
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { Textarea } from "@/components/ui/textarea";
import { useGetCategories } from "@/hooks/useCategories";
import { useCurrency } from "@/hooks/useCurrency";
import { useModelGuard } from "@/hooks/useModelGuard";
import {
	type Service,
	useCreateService,
	useDeleteService,
	useGetServices,
	useUpdateService,
} from "@/hooks/useService";
import { useGetSubCategories } from "@/hooks/useSubcategory";
import {
	type CreateServiceForm,
	createServiceSchema,
} from "@/validation/service.schema";
import { getServiceColumns } from "./columns";

type CategoryOption = { id: string; name: string };
type SubCategoryOption = { id: string; name: string; categoryId: string };

type ServiceFormFieldsProps = {
	register: UseFormRegister<CreateServiceForm>;
	errors: FieldErrors<CreateServiceForm>;
	isPending: boolean;
	onClose: () => void;
	categoryOptions: CategoryOption[];
	subCategoryOptions: SubCategoryOption[];
	watchedCategoryId: string;
	selectedSubCategoryId: string;
	onCategoryChange: (value: string) => void;
	onSubCategoryChange: (value: string) => void;
};

function ServiceFormFields({
	register,
	errors,
	isPending,
	onClose,
	categoryOptions,
	subCategoryOptions,
	watchedCategoryId,
	selectedSubCategoryId,
	onCategoryChange,
	onSubCategoryChange,
}: ServiceFormFieldsProps) {
	const filteredSubCategories = subCategoryOptions.filter(
		(sub) => sub.categoryId === watchedCategoryId,
	);

	return (
		<div className="space-y-6 p-6">
			<Field>
				<FieldLabel htmlFor="name">Service Name</FieldLabel>
				<Input id="name" placeholder="e.g., Hair Cut" {...register("name")} />
				{errors.name && <FieldError>{errors.name.message}</FieldError>}
			</Field>

			<div className="grid grid-cols-2 gap-4">
				<Field>
					<FieldLabel htmlFor="internalCost">Internal Cost</FieldLabel>
					<Input
						id="internalCost"
						type="number"
						step="0.01"
						placeholder="0.00"
						{...register("internalCost")}
					/>
					{errors.internalCost && (
						<FieldError>{errors.internalCost.message}</FieldError>
					)}
				</Field>

				<Field>
					<FieldLabel htmlFor="salePrice">Sale Price</FieldLabel>
					<Input
						id="salePrice"
						type="number"
						step="0.01"
						placeholder="0.00"
						{...register("salePrice")}
					/>
					{errors.salePrice && (
						<FieldError>{errors.salePrice.message}</FieldError>
					)}
				</Field>
			</div>

			<Field>
				<FieldLabel htmlFor="categoryId">Category</FieldLabel>
				<SearchableCombobox
					value={watchedCategoryId}
					onChange={onCategoryChange}
					options={categoryOptions.map((category) => ({
						value: category.id,
						label: category.name,
					}))}
					placeholder="Select a category..."
					searchPlaceholder="Search category..."
					emptyText="No category found."
					clearLabel="No category"
				/>
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
				<SearchableCombobox
					value={selectedSubCategoryId}
					onChange={onSubCategoryChange}
					options={filteredSubCategories.map((subCategory) => ({
						value: subCategory.id,
						label: subCategory.name,
					}))}
					placeholder={
						!watchedCategoryId
							? "Select a category first..."
							: filteredSubCategories.length === 0
								? "No subcategories available"
								: "Select a subcategory..."
					}
					searchPlaceholder="Search subcategory..."
					emptyText="No subcategory found."
					clearLabel="No subcategory"
					disabled={!watchedCategoryId || filteredSubCategories.length === 0}
				/>
			</Field>

			<Field>
				<FieldLabel htmlFor="description">Description</FieldLabel>
				<Textarea
					id="description"
					placeholder="Describe the service..."
					rows={3}
					{...register("description")}
				/>
			</Field>

			<div className="flex justify-end gap-3 pt-4">
				<Button type="button" variant="ghost" onClick={onClose}>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? "Saving..." : "Save Service"}
				</Button>
			</div>
		</div>
	);
}

export default function ServicesPage() {
	useModelGuard("service");
	const [createOpen, setCreateOpen] = useState(false);
	const [editService, setEditService] = useState<Service | null>(null);
	const { symbol } = useCurrency();
	const [tableParams, setTableParams] = useState<PaginationParams>({
		page: 1,
		pageSize: 10,
	});

	const { data: result, isLoading } = useGetServices(tableParams);
	const services = result?.data ?? [];
	const totalCount = result?.meta.total ?? 0;

	const { data: catResult } = useGetCategories({ page: 1, pageSize: 100 });
	const categoryOptions = catResult?.data ?? [];

	const { data: subCatResult } = useGetSubCategories({
		page: 1,
		pageSize: 100,
	});
	const subCategoryOptions = subCatResult?.data ?? [];

	const { mutate: createService, isPending: isCreating } = useCreateService();
	const { mutate: updateService, isPending: isUpdating } = useUpdateService();
	const { mutate: deleteService } = useDeleteService();

	const createForm = useForm<CreateServiceForm>({
		resolver: zodResolver(createServiceSchema),
		defaultValues: {
			name: "",
			internalCost: 0,
			salePrice: 0,
			description: "",
			categoryId: "",
			subCategoryId: "",
		},
	});

	const editForm = useForm<CreateServiceForm>({
		resolver: zodResolver(createServiceSchema),
		defaultValues: {
			name: "",
			internalCost: 0,
			salePrice: 0,
			description: "",
			categoryId: "",
			subCategoryId: "",
		},
	});

	const watchedCreateCategoryId = createForm.watch("categoryId") ?? "";
	const watchedEditCategoryId = editForm.watch("categoryId") ?? "";
	const watchedCreateSubCategoryId = createForm.watch("subCategoryId") ?? "";
	const watchedEditSubCategoryId = editForm.watch("subCategoryId") ?? "";

	const onCreateSubmit = (values: CreateServiceForm) => {
		createService(values, {
			onSuccess: () => {
				createForm.reset();
				setCreateOpen(false);
			},
		});
	};

	const onEditSubmit = (values: CreateServiceForm) => {
		if (!editService) return;
		updateService(
			{ id: editService.id, ...values },
			{
				onSuccess: () => {
					editForm.reset();
					setEditService(null);
				},
			},
		);
	};

	const openEdit = useCallback(
		(service: Service) => {
			setEditService(service);
			editForm.reset({
				name: service.name,
				internalCost: service.internalCost ?? 0,
				salePrice: service.salePrice,
				description: service.description ?? "",
				categoryId: service.categoryId,
				subCategoryId: service.subCategoryId ?? "",
			});
		},
		[editForm],
	);

	const columns = useMemo(
		() =>
			getServiceColumns(
				{
					onEdit: openEdit,
					onDelete: (id) => {
						if (confirm("Are you sure you want to delete this service?")) {
							deleteService(id);
						}
					},
				},
				symbol,
			),
		[openEdit, deleteService, symbol],
	);

	const avgSalePrice =
		services.length > 0
			? (
					services.reduce((sum, s) => sum + Number(s.salePrice), 0) /
					services.length
				).toFixed(2)
			: "0.00";

	return (
		<div className="container mx-auto p-6 space-y-4">
			<div className="grid gap-4 md:grid-cols-3">
				<MetricCard
					title="Total Services"
					value={totalCount.toString()}
					icon={ShoppingBag}
				/>
				<MetricCard
					title="Avg. Sale Price"
					value={`${symbol}${avgSalePrice}`}
					icon={DollarSign}
				/>
				<MetricCard
					title="Categories"
					value={categoryOptions.length.toString()}
					icon={Tag}
				/>
			</div>

			<Modal
				open={createOpen}
				onOpenChange={setCreateOpen}
				trigger={<Button>+ New Service</Button>}
				title="Create Service"
			>
				<form onSubmit={createForm.handleSubmit(onCreateSubmit)}>
					<ServiceFormFields
						register={createForm.register}
						errors={createForm.formState.errors}
						isPending={isCreating}
						onClose={() => setCreateOpen(false)}
						categoryOptions={categoryOptions}
						subCategoryOptions={subCategoryOptions}
						watchedCategoryId={watchedCreateCategoryId}
						selectedSubCategoryId={watchedCreateSubCategoryId}
						onCategoryChange={(value) =>
							createForm.setValue("categoryId", value, {
								shouldDirty: true,
								shouldValidate: true,
							})
						}
						onSubCategoryChange={(value) =>
							createForm.setValue("subCategoryId", value, {
								shouldDirty: true,
								shouldValidate: true,
							})
						}
					/>
				</form>
			</Modal>

			<Modal
				open={!!editService}
				onOpenChange={(open) => !open && setEditService(null)}
				title="Edit Service"
			>
				<form onSubmit={editForm.handleSubmit(onEditSubmit)}>
					<ServiceFormFields
						register={editForm.register}
						errors={editForm.formState.errors}
						isPending={isUpdating}
						onClose={() => setEditService(null)}
						categoryOptions={categoryOptions}
						subCategoryOptions={subCategoryOptions}
						watchedCategoryId={watchedEditCategoryId}
						selectedSubCategoryId={watchedEditSubCategoryId}
						onCategoryChange={(value) =>
							editForm.setValue("categoryId", value, {
								shouldDirty: true,
								shouldValidate: true,
							})
						}
						onSubCategoryChange={(value) =>
							editForm.setValue("subCategoryId", value, {
								shouldDirty: true,
								shouldValidate: true,
							})
						}
					/>
				</form>
			</Modal>

			<DataTable
				title="Services"
				columns={columns}
				data={services}
				totalCount={totalCount}
				currentPage={tableParams.page}
				pageSize={tableParams.pageSize}
				onPaginationChange={setTableParams}
				loading={isLoading}
				searchPlaceholder="Search services..."
			/>
		</div>
	);
}
