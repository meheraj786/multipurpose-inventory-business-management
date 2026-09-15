import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	PreparedProductApiService,
	type PreparedProductQueryParams,
} from "@/lib/api/services/preparedProduct.service";
import type {
	CreatePreparedProductForm,
	UpdatePreparedProductForm,
} from "@/validation/preparedProduct.schema";

const PREPARED_PRODUCT_KEY = "prepared-products";

export const useGetPreparedProducts = (
	params: PreparedProductQueryParams,
	options?: { enabled?: boolean },
) =>
	useQuery({
		queryKey: [PREPARED_PRODUCT_KEY, params],
		queryFn: () => PreparedProductApiService.getAll(params),
		placeholderData: (prev) => prev,
		enabled: options?.enabled ?? true,
	});

export const useGetSinglePreparedProduct = (id: string) =>
	useQuery({
		queryKey: [PREPARED_PRODUCT_KEY, id],
		queryFn: () => PreparedProductApiService.getOne(id),
		enabled: !!id,
	});

export const useCreatePreparedProduct = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreatePreparedProductForm) =>
			PreparedProductApiService.create(payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: [PREPARED_PRODUCT_KEY] }),
	});
};

export const useUpdatePreparedProduct = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			...payload
		}: UpdatePreparedProductForm & { id: string }) =>
			PreparedProductApiService.update(id, payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: [PREPARED_PRODUCT_KEY] }),
	});
};

export const useDeletePreparedProduct = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => PreparedProductApiService.remove(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: [PREPARED_PRODUCT_KEY] }),
	});
};

export const useProduceStock = (id: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (quantity: number) =>
			PreparedProductApiService.produceStock(id, quantity),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [PREPARED_PRODUCT_KEY, id] });
			qc.invalidateQueries({ queryKey: [PREPARED_PRODUCT_KEY] });
			qc.invalidateQueries({ queryKey: ["raw-products"] });
		},
	});
};

export type {
	PreparedProduct,
	PreparedProductItem,
	PreparedProductStock,
} from "@/lib/api/services/preparedProduct.service";
