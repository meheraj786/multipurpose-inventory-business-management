import type { PaginationParams } from "@/components/data-table";
import api from "../client";

export type CategoryPayload = {
	name: string;
	description?: string;
};

export type CategoryResponse = {
	id: string;
	name: string;
	description?: string | null;
	features: string[];
	accountId: string;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
	subCategories: {
		id: string;
		name: string;
		categoryId?: string;
		isDeleted?: boolean;
		createdAt?: string; // ← string, not Date
	}[];
	services: { id: string; name: string }[];
};

export type PaginatedCategoryResponse = {
	data: CategoryResponse[];
	total: number;
	page: number;
	pageSize: number;
};

const buildParams = (params: PaginationParams) => ({
	page: params.page,
	pageSize: params.pageSize,
	...(params.search && { search: params.search }),
	...(params.sortBy && { sortBy: params.sortBy }),
	...(params.sortOrder && { sortOrder: params.sortOrder }),
});

export const categoryService = {
	getAll: async (
		params: PaginationParams,
	): Promise<PaginatedCategoryResponse> => {
		const res = await api.get("/categories", { params: buildParams(params) });
		return res.data.data;
	},

	getOne: async (id: string): Promise<CategoryResponse> => {
		const res = await api.get(`/categories/${id}`);
		return res.data.data;
	},

	create: async (payload: CategoryPayload): Promise<CategoryResponse> => {
		const res = await api.post("/categories", payload);
		return res.data.data;
	},

	update: async (
		id: string,
		payload: CategoryPayload,
	): Promise<CategoryResponse> => {
		const res = await api.patch(`/categories/${id}`, payload);
		return res.data.data;
	},

	delete: async (id: string): Promise<void> => {
		await api.delete(`/categories/${id}`);
	},
};
