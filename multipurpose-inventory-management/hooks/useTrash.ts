import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PaginationParams } from "@/components/data-table";
import { trashService } from "@/lib/api/services/trashService";

const TRASH_KEY = "trash";

type TrashParams = PaginationParams & { moduleName?: string };

export const useGetTrash = (params: TrashParams) => {
	return useQuery({
		queryKey: [TRASH_KEY, params],
		queryFn: () => trashService.getAll(params),
		placeholderData: (prev) => prev,
	});
};

export const useRestoreItem = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => trashService.restore(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [TRASH_KEY] });
			queryClient.invalidateQueries();
			toast.success("Item restored successfully");
		},
		onError: () => {
			toast.error("Failed to restore item");
		},
	});
};

export const usePermanentDelete = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => trashService.permanentDelete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [TRASH_KEY] });
			toast.success("Item permanently deleted");
		},
		onError: () => {
			toast.error("Failed to delete item");
		},
	});
};
