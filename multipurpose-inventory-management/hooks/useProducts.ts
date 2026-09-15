import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ProductApiService,
	type ProductQueryParams,
} from "@/lib/api/services/product.service";
import type {
	CreateProductForm,
	StockInForm,
	UpdateProductForm,
} from "@/validation/product.schema";

const PRODUCT_KEY = "products";

export const useGetProducts = (params: ProductQueryParams) =>
	useQuery({
		queryKey: [PRODUCT_KEY, params],
		queryFn: () => ProductApiService.getAll(params),
	});

export const useGetSingleProduct = (id: string) =>
	useQuery({
		queryKey: [PRODUCT_KEY, id],
		queryFn: () => ProductApiService.getOne(id),
		enabled: !!id,
	});

export const useCreateProduct = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateProductForm) =>
			ProductApiService.create(payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCT_KEY] }),
	});
};

export const useUpdateProduct = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...payload }: UpdateProductForm & { id: string }) =>
			ProductApiService.update(id, payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCT_KEY] }),
	});
};

export const useDeleteProduct = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => ProductApiService.remove(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCT_KEY] }),
	});
};

export const useStockIn = (productId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: StockInForm) =>
			ProductApiService.stockIn(productId, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [PRODUCT_KEY, productId] });
			qc.invalidateQueries({ queryKey: [PRODUCT_KEY] });
		},
	});
};

export const useGetStockSummary = (productId: string) =>
	useQuery({
		queryKey: [PRODUCT_KEY, productId, "stock-summary"],
		queryFn: () => ProductApiService.getStockSummary(productId),
		enabled: !!productId,
	});

export type {
	Product,
	ProductSaleItem,
	ProductStock,
} from "@/lib/api/services/product.service";
