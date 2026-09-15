import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerReturnService } from "@/lib/api/services/customerReturn.service";
import type { UpdateCustomerReturnInput } from "@/validation/customerReturn.service";

export const useCreateCustomerReturn = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: customerReturnService.createCustomerReturn,
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["customer-returns"] });
			queryClient.invalidateQueries({ queryKey: ["sales"] });
			queryClient.invalidateQueries({ queryKey: ["sales", variables.saleId] });
		},
	});
};

export const useGetAllReturns = (page = 1, limit = 10, search?: string) => {
	return useQuery({
		queryKey: ["customer-returns", { page, limit, search }],
		queryFn: () => customerReturnService.getAllReturns(page, limit, search),
		placeholderData: (previousData) => previousData,
	});
};

export const useGetSingleReturn = (id: string) => {
	return useQuery({
		queryKey: ["customer-returns", id],
		queryFn: () => customerReturnService.getSingleReturn(id),
		enabled: !!id,
	});
};

export const useUpdateReturn = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateCustomerReturnInput) =>
			customerReturnService.updateReturn(id, data),
		onSuccess: (data) => {
			queryClient.setQueryData(["customer-returns", id], data);
			queryClient.invalidateQueries({ queryKey: ["customer-returns"] });
			queryClient.invalidateQueries({ queryKey: ["sales"] });
		},
	});
};

export const useDeleteReturn = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: customerReturnService.deleteReturn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["customer-returns"] });
			queryClient.invalidateQueries({ queryKey: ["sales"] });
		},
	});
};
