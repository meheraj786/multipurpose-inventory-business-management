import { useQuery } from "@tanstack/react-query";
import type { PaginationParams } from "@/components/data-table";
import { activityLogService } from "@/lib/api/services/activityLogService";

const ACTIVITY_LOG_KEY = "activityLogs";

type ActivityLogParams = PaginationParams & {
	module?: string;
	action?: string;
	userId?: string;
};

export const useGetActivityLogs = (params: ActivityLogParams) => {
	return useQuery({
		queryKey: [ACTIVITY_LOG_KEY, params],
		queryFn: () => activityLogService.getAll(params),
		placeholderData: (prev) => prev,
	});
};
