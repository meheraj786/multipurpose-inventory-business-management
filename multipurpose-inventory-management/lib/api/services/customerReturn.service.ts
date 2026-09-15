import type { ApiResponse } from "@/validation/auth.schema";
import type {
	CreateCustomerReturnInput,
	CustomerReturnDetail,
	PaginatedReturnResponse,
	UpdateCustomerReturnInput,
} from "@/validation/customerReturn.service";
import {
	createCustomerReturnSchema,
	updateCustomerReturnSchema,
} from "@/validation/customerReturn.service";
import api from "../client";

export const customerReturnService = {
	createCustomerReturn: async (data: CreateCustomerReturnInput) => {
		const validated = createCustomerReturnSchema.parse(data);
		const response = await api.post("/customer-returns", validated);
		return (response.data as ApiResponse<CustomerReturnDetail>).data;
	},

	getAllReturns: async (page = 1, limit = 10, search?: string) => {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});
		if (search) params.append("search", search);

		const response = await api.get(`/customer-returns?${params.toString()}`);
		return (response.data as ApiResponse<PaginatedReturnResponse>).data;
	},

	getSingleReturn: async (id: string) => {
		const response = await api.get(`/customer-returns/${id}`);
		return (response.data as ApiResponse<CustomerReturnDetail>).data;
	},

	updateReturn: async (id: string, data: UpdateCustomerReturnInput) => {
		const validated = updateCustomerReturnSchema.parse(data);
		const response = await api.patch(`/customer-returns/${id}`, validated);
		return (response.data as ApiResponse<CustomerReturnDetail>).data;
	},

	deleteReturn: async (id: string) => {
		const response = await api.delete(`/customer-returns/${id}`);
		return (response.data as ApiResponse<CustomerReturnDetail>).data;
	},
};
