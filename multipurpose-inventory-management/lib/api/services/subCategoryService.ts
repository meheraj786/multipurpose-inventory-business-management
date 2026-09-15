import type { PaginationParams } from "@/components/data-table";
import type { SubCategoryData } from "@/validation/subcategory.schema";
import api from "../client";

export type SubCategoryPayload = {
	name: string;
	description?: string;
	categoryId: string;
};

export type SubCategoryResponse = SubCategoryData & {
	accountId: string;
	updatedAt: string;
};

export type PaginatedSubCategoryResponse = {
	data: SubCategoryResponse[];
	total: number;
	page: number;
	pageSize: number;
};

type SubCategoryParams = PaginationParams & { categoryId?: string };

const buildParams = (params: SubCategoryParams) => ({
	page: params.page,
	pageSize: params.pageSize,
	...(params.search && { search: params.search }),
	...(params.sortBy && { sortBy: params.sortBy }),
	...(params.sortOrder && { sortOrder: params.sortOrder }),
	...(params.categoryId && { categoryId: params.categoryId }),
});

export const subCategoryService = {
	getAll: async (
		params: SubCategoryParams,
	): Promise<PaginatedSubCategoryResponse> => {
		const res = await api.get("/sub-categories", {
			params: buildParams(params),
		});
		return res.data.data;
	},

	getOne: async (id: string): Promise<SubCategoryResponse> => {
		const res = await api.get(`/sub-categories/${id}`);
		return res.data.data;
	},

	create: async (payload: SubCategoryPayload): Promise<SubCategoryResponse> => {
		const res = await api.post("/sub-categories", payload);
		return res.data.data;
	},

	update: async (
		id: string,
		payload: Partial<SubCategoryPayload>,
	): Promise<SubCategoryResponse> => {
		const res = await api.patch(`/sub-categories/${id}`, payload);
		return res.data.data;
	},

	delete: async (id: string): Promise<void> => {
		await api.delete(`/sub-categories/${id}`);
	},
};
