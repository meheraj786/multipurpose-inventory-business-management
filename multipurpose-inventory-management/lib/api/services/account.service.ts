import type {
	AccountDetail,
	CreateAccountInput,
	PaginatedAccountResponse,
	UpdateAccountInput,
} from "@/validation/account.schema";
import {
	createAccountSchema,
	updateAccountSchema,
} from "@/validation/account.schema";
import type { ApiResponse } from "@/validation/auth.schema";
import api from "../client";

export const accountService = {
	getMyAccount: async () => {
		const response = await api.get("/accounts/me");
		return (response.data as ApiResponse<AccountDetail>).data;
	},

	updateMyAccount: async (data: UpdateAccountInput) => {
		const validated = updateAccountSchema.parse(data);
		const response = await api.patch("/accounts/me", validated);
		return (response.data as ApiResponse<AccountDetail>).data;
	},

	createAccount: async (data: CreateAccountInput) => {
		const validated = createAccountSchema.parse(data);
		const response = await api.post("/accounts", validated);
		return (response.data as ApiResponse<AccountDetail>).data;
	},

	getAllAccounts: async (page = 1, limit = 10, search?: string) => {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});
		if (search) params.append("search", search);

		const response = await api.get(`/accounts?${params.toString()}`);
		return (response.data as ApiResponse<PaginatedAccountResponse>).data;
	},

	getSingleAccount: async (id: string) => {
		const response = await api.get(`/accounts/${id}`);
		return (response.data as ApiResponse<AccountDetail>).data;
	},

	updateSingleAccount: async (id: string, data: UpdateAccountInput) => {
		const validated = updateAccountSchema.parse(data);
		const response = await api.patch(`/accounts/${id}`, validated);
		return (response.data as ApiResponse<AccountDetail>).data;
	},

	deleteAccount: async (id: string) => {
		const response = await api.delete(`/accounts/${id}`);
		return (response.data as ApiResponse<AccountDetail>).data;
	},
};
