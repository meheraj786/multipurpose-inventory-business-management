import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { accountService } from "@/lib/api/services/account.service";
import { useAuthStore } from "@/lib/store/useAuthStore";
import type { UpdateAccountInput } from "@/validation/account.schema";

export const useGetMyAccount = () => {
	return useQuery({
		queryKey: ["accounts", "me"],
		queryFn: accountService.getMyAccount,
		staleTime: 5 * 60 * 1000,
	});
};

export const useUpdateMyAccount = () => {
	const queryClient = useQueryClient();
	const { user, setAuth } = useAuthStore();

	return useMutation({
		mutationFn: accountService.updateMyAccount,
		onSuccess: (data) => {
			queryClient.setQueryData(["accounts", "me"], data);
			queryClient.invalidateQueries({ queryKey: ["accounts"] });

			if (user && data) {
				const updatedUser = {
					...user,
					account: {
						...user.account,
						companyName: data.companyName,
						model: data.model,
						status: data.status,
						currency: data.currency,
					},
				};
				setAuth(updatedUser);
				Cookies.set("userModel", data.model);
			}
		},
	});
};

export const useCreateAccount = () => {
	const queryClient = useQueryClient();
	const { user, setAuth } = useAuthStore();

	return useMutation({
		mutationFn: accountService.createAccount,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["accounts"] });

			if (user && data) {
				const updatedUser = {
					...user,
					accountId: data.id,
					account: {
						id: data.id,
						companyName: data.companyName,
						model: data.model,
						status: data.status,
						currency: data.currency,
					},
				};
				setAuth(updatedUser);
				Cookies.set("userModel", data.model);
			}
		},
	});
};

export const useGetAllAccounts = (page = 1, limit = 10, search?: string) => {
	return useQuery({
		queryKey: ["accounts", { page, limit, search }],
		queryFn: () => accountService.getAllAccounts(page, limit, search),
		placeholderData: (previousData) => previousData,
	});
};

export const useGetSingleAccount = (id: string) => {
	return useQuery({
		queryKey: ["accounts", id],
		queryFn: () => accountService.getSingleAccount(id),
		enabled: !!id,
	});
};

export const useUpdateSingleAccount = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateAccountInput) =>
			accountService.updateSingleAccount(id, data),
		onSuccess: (data) => {
			queryClient.setQueryData(["accounts", id], data);
			queryClient.invalidateQueries({ queryKey: ["accounts"] });
		},
	});
};

export const useDeleteAccount = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: accountService.deleteAccount,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["accounts"] });
		},
	});
};
