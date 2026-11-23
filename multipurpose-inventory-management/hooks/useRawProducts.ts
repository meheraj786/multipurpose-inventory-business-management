import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	RawProductApiService,
	type RawProductQueryParams,
	type RawProductStockQueryParams,
} from "@/lib/api/services/rawProduct.service";
import type {
	CreateRawProductForm,
	RawProductStockInForm,
	UpdateRawProductForm,
} from "@/validation/rawProduct.schema";

const RAW_PRODUCT_KEY = "raw-products";
const RAW_PRODUCT_STOCK_KEY = "raw-product-stocks";

export const useGetRawProducts = (params: RawProductQueryParams) =>
	useQuery({
		queryKey: [RAW_PRODUCT_KEY, params],
		queryFn: () => RawProductApiService.getAll(params),
	});

export const useGetSingleRawProduct = (id: string) =>
	useQuery({
		queryKey: [RAW_PRODUCT_KEY, id],
		queryFn: () => RawProductApiService.getOne(id),
		enabled: !!id,
	});

export const useCreateRawProduct = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateRawProductForm) =>
			RawProductApiService.create(payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: [RAW_PRODUCT_KEY] }),
	});
};

export const useUpdateRawProduct = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...payload }: UpdateRawProductForm & { id: string }) =>
			RawProductApiService.update(id, payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: [RAW_PRODUCT_KEY] }),
	});
};

export const useDeleteRawProduct = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => RawProductApiService.remove(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: [RAW_PRODUCT_KEY] }),
	});
};

export const useRawProductStockIn = (rawProductId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: RawProductStockInForm) =>
			RawProductApiService.stockIn(rawProductId, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [RAW_PRODUCT_KEY, rawProductId] });
			qc.invalidateQueries({ queryKey: [RAW_PRODUCT_KEY] });
			qc.invalidateQueries({ queryKey: [RAW_PRODUCT_STOCK_KEY] });
		},
	});
};

export const useGetRawProductStocks = (params: RawProductStockQueryParams) =>
	useQuery({
		queryKey: [RAW_PRODUCT_STOCK_KEY, params],
		queryFn: () => RawProductApiService.getAllStocks(params),
		placeholderData: (prev) => prev,
	});

export type {
	RawProduct,
	RawProductStock,
} from "@/lib/api/services/rawProduct.service";
