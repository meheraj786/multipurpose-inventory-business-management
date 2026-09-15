import type { PaginationParams } from "@/components/data-table";
import api from "@/lib/api/client";

export type ActivityLogResponse = {
	id: string;
	userId: string;
	user: {
		id: string;
		email: string;
	};
	module: string;
	action: string;
	details?: string | null;
	accountId: string;
	dateTime: string;
};

export type PaginatedActivityLogResponse = {
	data: ActivityLogResponse[];
	total: number;
	page: number;
	pageSize: number;
};

type ActivityLogParams = PaginationParams & {
	module?: string;
	action?: string;
	userId?: string;
};

const buildParams = (params: ActivityLogParams) => ({
	page: params.page,
	pageSize: params.pageSize,
	...(params.search && { search: params.search }),
	...(params.module && { module: params.module }),
	...(params.action && { action: params.action }),
	...(params.userId && { userId: params.userId }),
});

export const activityLogService = {
	getAll: async (
		params: ActivityLogParams,
	): Promise<PaginatedActivityLogResponse> => {
		const res = await api.get("/activity-logs", {
			params: buildParams(params),
		});
		return res.data.data;
	},
};
