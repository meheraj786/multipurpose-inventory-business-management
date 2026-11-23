import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ServiceApiService,
	type ServiceQueryParams,
} from "@/lib/api/services/service.service";
import type {
	CreateServiceForm,
	UpdateServiceForm,
} from "@/validation/service.schema";

const SERVICE_KEY = "services";

export const useGetServices = (params: ServiceQueryParams) =>
	useQuery({
		queryKey: [SERVICE_KEY, params],
		queryFn: () => ServiceApiService.getAll(params),
	});

export const useGetSingleService = (id: string) =>
	useQuery({
		queryKey: [SERVICE_KEY, id],
		queryFn: () => ServiceApiService.getOne(id),
		enabled: !!id,
	});

export const useCreateService = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateServiceForm) =>
			ServiceApiService.create(payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: [SERVICE_KEY] }),
	});
};

export const useUpdateService = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...payload }: UpdateServiceForm & { id: string }) =>
			ServiceApiService.update(id, payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: [SERVICE_KEY] }),
	});
};

export const useDeleteService = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => ServiceApiService.remove(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: [SERVICE_KEY] }),
	});
};

export type { SaleService, Service } from "@/lib/api/services/service.service";
