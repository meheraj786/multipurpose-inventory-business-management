import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryService } from "@/lib/api/services/categoryService";
import { queryKeys } from "@/lib/queryKeys";
import type { CreateCategoryForm } from "@/validation/category.schema";

export const useGetCategories = (params = { page: 1, pageSize: 10 }) => {
	return useQuery({
		queryKey: [queryKeys.categories, params],
		queryFn: () => categoryService.getAll(params),
		placeholderData: (prev) => prev,
	});
};

/**
 * @param id - Category ID
 */
export const useGetCategory = (id = "") => {
	return useQuery({
		queryKey: [queryKeys.categories, id],
		queryFn: () => categoryService.getOne(id),
		enabled: !!id,
	});
};

export const useCreateCategory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateCategoryForm) =>
			categoryService.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.categories] });
			toast.success("Category created successfully");
		},
		onError: () => toast.error("Failed to create category"),
	});
};

export const useUpdateCategory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: CreateCategoryForm;
		}) => categoryService.update(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.categories] });
			toast.success("Category updated successfully");
		},
		onError: () => toast.error("Failed to update category"),
	});
};

export const useDeleteCategory = () => {
	const queryClient = useQueryClient();

	const mutationFn = (id = "") => categoryService.delete(id);

	return useMutation({
		mutationFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.categories] });
			toast.success("Category moved to trash");
		},
		onError: () => {
			toast.error("Failed to delete category");
		},
	});
};
