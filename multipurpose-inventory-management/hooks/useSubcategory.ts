import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PaginationParams } from "@/components/data-table";
import {
	type SubCategoryPayload,
	subCategoryService,
} from "@/lib/api/services/subCategoryService";
import { queryKeys } from "@/lib/queryKeys";

type SubCategoryParams = PaginationParams & { categoryId?: string };

// ─── READ (paginated) ────────────────────────────────────────────────────────

export const useGetSubCategories = (params: SubCategoryParams) => {
	return useQuery({
		queryKey: [queryKeys.subCategories, params],
		queryFn: () => subCategoryService.getAll(params),
		placeholderData: (prev) => prev,
	});
};

// ─── READ (single) ───────────────────────────────────────────────────────────

export const useGetSubCategory = (id: string) => {
	return useQuery({
		queryKey: [queryKeys.subCategories, id],
		queryFn: () => subCategoryService.getOne(id),
		enabled: !!id,
	});
};

// ─── CREATE ──────────────────────────────────────────────────────────────────

export const useCreateSubCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: SubCategoryPayload) =>
			subCategoryService.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.subCategories] });
			// Also refresh categories since their subCategories array changed
			queryClient.invalidateQueries({ queryKey: [queryKeys.categories] });
			toast.success("Sub-category created successfully");
		},
		onError: () => {
			toast.error("Failed to create sub-category");
		},
	});
};

// ─── UPDATE ──────────────────────────────────────────────────────────────────

export const useUpdateSubCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: Partial<SubCategoryPayload>;
		}) => subCategoryService.update(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.subCategories] });
			queryClient.invalidateQueries({ queryKey: [queryKeys.categories] });
			toast.success("Sub-category updated successfully");
		},
		onError: () => {
			toast.error("Failed to update sub-category");
		},
	});
};

// ─── DELETE ──────────────────────────────────────────────────────────────────

export const useDeleteSubCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => subCategoryService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.subCategories] });
			queryClient.invalidateQueries({ queryKey: [queryKeys.categories] });
			toast.success("Sub-category moved to trash");
		},
		onError: () => {
			toast.error("Failed to delete sub-category");
		},
	});
};
