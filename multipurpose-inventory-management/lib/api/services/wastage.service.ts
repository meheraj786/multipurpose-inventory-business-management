import type { ApiResponse } from "@/validation/auth.schema";
import type {
	CreateWastageInput,
	PaginatedWastageResponse,
	UpdateWastageInput,
	WastageDetail,
} from "@/validation/wastage.schema";
import {
	createWastageSchema,
	updateWastageSchema,
} from "@/validation/wastage.schema";
import api from "../client";

export const wastageService = {
	createWastage: async (data: CreateWastageInput) => {
		const validated = createWastageSchema.parse(data);
		const response = await api.post("/wastages", validated);
		return (response.data as ApiResponse<WastageDetail>).data;
	},

	getAllWastages: async (page = 1, limit = 10, search?: string) => {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});
		if (search) params.append("search", search);

		const response = await api.get(`/wastages?${params.toString()}`);
		return (response.data as ApiResponse<PaginatedWastageResponse>).data;
	},

	getSingleWastage: async (id: string) => {
		const response = await api.get(`/wastages/${id}`);
		return (response.data as ApiResponse<WastageDetail>).data;
	},

	updateWastage: async (id: string, data: UpdateWastageInput) => {
		const validated = updateWastageSchema.parse(data);
		const response = await api.patch(`/wastages/${id}`, validated);
		return (response.data as ApiResponse<WastageDetail>).data;
	},

	deleteWastage: async (id: string) => {
		const response = await api.delete(`/wastages/${id}`);
		return (response.data as ApiResponse<WastageDetail>).data;
	},
};
