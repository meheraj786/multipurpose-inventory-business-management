import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wastageService } from "@/lib/api/services/wastage.service";
import type { UpdateWastageInput } from "@/validation/wastage.schema";

export const useCreateWastage = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: wastageService.createWastage,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wastages"] });
		},
	});
};

export const useGetAllWastages = (page = 1, limit = 10, search?: string) => {
	return useQuery({
		queryKey: ["wastages", { page, limit, search }],
		queryFn: () => wastageService.getAllWastages(page, limit, search),
		placeholderData: (previousData) => previousData,
	});
};

export const useGetSingleWastage = (id: string) => {
	return useQuery({
		queryKey: ["wastages", id],
		queryFn: () => wastageService.getSingleWastage(id),
		enabled: !!id,
	});
};

export const useUpdateWastage = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateWastageInput) =>
			wastageService.updateWastage(id, data),
		onSuccess: (data) => {
			queryClient.setQueryData(["wastages", id], data);
			queryClient.invalidateQueries({ queryKey: ["wastages"] });
		},
	});
};

export const useDeleteWastage = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: wastageService.deleteWastage,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wastages"] });
		},
	});
};
