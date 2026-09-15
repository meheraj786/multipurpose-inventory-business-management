import type { PaginationParams } from "@/components/data-table";
import api from "@/lib/api/client";

export type TrashResponse = {
	id: string;
	moduleName: string;
	itemName: string;
	itemId: string;
	deletedBy: string;
	accountId: string;
	date: string;
};

export type PaginatedTrashResponse = {
	data: TrashResponse[];
	total: number;
	page: number;
	pageSize: number;
};

type TrashParams = PaginationParams & { moduleName?: string };

const buildParams = (params: TrashParams) => ({
	page: params.page,
	pageSize: params.pageSize,
	...(params.search && { search: params.search }),
	...(params.moduleName && { moduleName: params.moduleName }),
});

export const trashService = {
	getAll: async (params: TrashParams): Promise<PaginatedTrashResponse> => {
		const res = await api.get("/trash", { params: buildParams(params) });
		return res.data.data;
	},

	restore: async (id: string): Promise<{ message: string }> => {
		const res = await api.post(`/trash/restore/${id}`);
		return res.data.data;
	},

	permanentDelete: async (id: string): Promise<void> => {
		await api.delete(`/trash/${id}`);
	},
};
