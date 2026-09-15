import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	type CustomerPayload,
	customerService,
	type UpdateCustomerPayload,
} from "@/lib/api/services/customerService";
import { queryKeys } from "@/lib/queryKeys";

export const useGetCustomers = (params = { page: 1, pageSize: 10 }) => {
	return useQuery({
		queryKey: [queryKeys.customers, params],
		queryFn: () => customerService.getAll(params),
		placeholderData: (prev) => prev,
	});
};

export const useGetCustomer = (id = "") => {
	return useQuery({
		queryKey: [queryKeys.customers, id],
		queryFn: () => customerService.getOne(id),
		enabled: !!id,
	});
};

export const useCreateCustomer = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CustomerPayload) => customerService.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.customers] });
			toast.success("Customer created successfully");
		},
		onError: () => {
			toast.error("Failed to create customer");
		},
	});
};

export const useUpdateCustomer = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: UpdateCustomerPayload;
		}) => customerService.update(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.customers] });
			toast.success("Customer updated successfully");
		},
		onError: () => {
			toast.error("Failed to update customer");
		},
	});
};

export const useDeleteCustomer = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => customerService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.customers] });
			toast.success("Customer moved to trash");
		},
		onError: () => {
			toast.error("Failed to delete customer");
		},
	});
};
