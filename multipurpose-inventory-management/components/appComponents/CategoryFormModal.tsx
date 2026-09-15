"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";
// import type { CategoryPayload } from "@/lib/api/services/categoryService";
import type {
	CategoryData,
	CreateCategoryForm,
} from "@/validation/category.schema";

type Props = {
	onClose: () => void;
	category?: CategoryData; // provided → edit mode
};

export function CategoryFormModal({ onClose, category }: Props) {
	const isEdit = !!category;
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateCategoryForm>();

	useEffect(() => {
		if (category) {
			reset({
				name: category.name,
				description: category.description ?? "",
			});
		} else {
			reset({ name: "", description: "" });
		}
	}, [category, reset]);

	const { mutate: create, isPending: creating } = useCreateCategory();
	const { mutate: update, isPending: updating } = useUpdateCategory();
	const isPending = creating || updating;

	const onSubmit = (values: CreateCategoryForm) => {
		if (isEdit) {
			update({ id: category.id, payload: values }, { onSuccess: onClose });
		} else {
			create(values, { onSuccess: onClose });
		}
	};

	return (
		<form className="space-y-5 p-6" onSubmit={handleSubmit(onSubmit)}>
			<Field>
				<FieldLabel htmlFor="name">Category Name *</FieldLabel>
				<Input
					id="name"
					placeholder="e.g., Electronics"
					{...register("name", { required: "Name is required" })}
				/>
				{errors.name && <FieldError>{errors.name.message}</FieldError>}
			</Field>

			<Field>
				<FieldLabel htmlFor="description">Description</FieldLabel>
				<Textarea
					id="description"
					placeholder="Describe this category..."
					rows={3}
					className="resize-none"
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
							? "Update Category"
							: "Save Category"}
				</Button>
			</div>
		</form>
	);
}
