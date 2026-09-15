import type {
	CreatePreparedProductForm,
	UpdatePreparedProductForm,
} from "@/validation/preparedProduct.schema";
import api from "../client";

export type PreparedProductUnit = { id: string; name: string; symbol: string };

export type PreparedProductRawProduct = {
	id: string;
	name: string;
	unit: PreparedProductUnit;
	totalStock?: number;
};

export type PreparedProductItem = {
	id: string;
	preparedProductId: string;
	rawProductId: string;
	rawProduct: PreparedProductRawProduct;
	quantity: number;
	unit: string;
};

export type PreparedProductStock = {
	id: string;
	preparedProductId: string;
	quantity: number;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
};

export type PreparedProduct = {
	id: string;
	name: string;
	unitId: string;
	unit: PreparedProductUnit;
	categoryId: string;
	subCategoryId: string | null;
	rawMaterialCost: number | null;
	defaultSalePrice: number | null;
	expiryDate: string | null;
	description: string | null;
	img: string | null;
	totalStock: number;
	preparedProductItems?: PreparedProductItem[];
	preparedProductStocks?: PreparedProductStock[];
	createdAt: string;
	updatedAt: string;
	length?: number;
};

export type PreparedProductListResponse = {
	data: PreparedProduct[];
	meta: { total: number; page: number; limit: number; totalPages: number };
};

export type PreparedProductQueryParams = {
	page?: number;
	pageSize?: number;
	search?: string;
	categoryId?: string;
};

const getAll = async (
	params: PreparedProductQueryParams,
): Promise<PreparedProductListResponse> => {
	const { data } = await api.get("/prepared-products", {
		params: {
			page: params.page,
			limit: params.pageSize,
			...(params.search && { search: params.search }),
			...(params.categoryId && { categoryId: params.categoryId }),
		},
	});
	return data;
};

const getOne = async (id: string): Promise<PreparedProduct> => {
	const { data } = await api.get(`/prepared-products/${id}`);
	return data.data;
};

const create = async (
	payload: CreatePreparedProductForm,
): Promise<PreparedProduct> => {
	const { data } = await api.post("/prepared-products", payload);
	return data.data;
};

const update = async (
	id: string,
	payload: UpdatePreparedProductForm,
): Promise<PreparedProduct> => {
	const { data } = await api.patch(`/prepared-products/${id}`, payload);
	return data.data;
};

const remove = async (id: string): Promise<void> => {
	await api.delete(`/prepared-products/${id}`);
};

const produceStock = async (
	id: string,
	quantity: number,
): Promise<PreparedProductStock> => {
	const { data } = await api.post(`/prepared-products/${id}/produce`, {
		quantity,
	});
	return data.data;
};

export const PreparedProductApiService = {
	getAll,
	getOne,
	create,
	update,
	remove,
	produceStock,
};
