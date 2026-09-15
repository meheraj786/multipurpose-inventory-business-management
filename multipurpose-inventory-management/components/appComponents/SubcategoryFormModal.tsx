"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { Textarea } from "@/components/ui/textarea";
import { useGetCategories } from "@/hooks/useCategories";
import {
	useCreateSubCategory,
	useUpdateSubCategory,
} from "@/hooks/useSubcategory";
import type { SubCategoryData } from "@/validation/subcategory.schema";
import {
	type CreateSubCategoryForm,
	createSubCategorySchema,
} from "@/validation/subcategory.schema";

type Props = {
	onClose: () => void;
	subCategory?: SubCategoryData; // provided → edit mode
};

export function SubCategoryFormModal({ onClose, subCategory }: Props) {
	const isEdit = !!subCategory;

	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors },
	} = useForm<CreateSubCategoryForm>({
		resolver: zodResolver(createSubCategorySchema),
		defaultValues: { categoryId: "", name: "", description: "" },
	});

	// Pre-fill in edit mode
	useEffect(() => {
		if (subCategory) {
			reset({
				categoryId: subCategory.categoryId,
				name: subCategory.name,
				description: subCategory.description ?? "",
			});
		} else {
			reset({ categoryId: "", name: "", description: "" });
		}
	}, [subCategory, reset]);

	const { data: catResult } = useGetCategories({ page: 1, pageSize: 100 });
	const categoryOptions = catResult?.data ?? [];
	const selectedCategoryId = watch("categoryId") ?? "";

	const { mutate: create, isPending: creating } = useCreateSubCategory();
	const { mutate: update, isPending: updating } = useUpdateSubCategory();
	const isPending = creating || updating;

	const onSubmit = (values: CreateSubCategoryForm) => {
		if (isEdit) {
			update({ id: subCategory.id, payload: values }, { onSuccess: onClose });
		} else {
			create(values, { onSuccess: onClose });
		}
	};

	return (
		<form className="space-y-5 p-6" onSubmit={handleSubmit(onSubmit)}>
			<Field>
				<FieldLabel htmlFor="categoryId">Parent Category *</FieldLabel>
				<SearchableCombobox
					value={selectedCategoryId}
					onChange={(value) =>
						setValue("categoryId", value, {
							shouldDirty: true,
							shouldValidate: true,
						})
					}
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
				<FieldLabel htmlFor="name">Subcategory Name *</FieldLabel>
				<Input
					id="name"
					placeholder="e.g., Luxury Watches"
					{...register("name")}
				/>
				{errors.name && <FieldError>{errors.name.message}</FieldError>}
			</Field>

			<Field>
				<FieldLabel htmlFor="description">Description</FieldLabel>
				<Textarea
					id="description"
					placeholder="Details about this collection..."
					rows={3}
					{...register("description")}
				/>
			</Field>

			<div className="flex justify-end gap-3 pt-2">
				<Button type="button" variant="ghost" onClick={onClose}>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending
						? "Saving..."
						: isEdit
							? "Update Subcategory"
							: "Create Subcategory"}
				</Button>
			</div>
		</form>
	);
}
