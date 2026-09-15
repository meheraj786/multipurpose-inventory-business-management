import type {
	CreateRawProductForm,
	RawProductStockInForm,
	UpdateRawProductForm,
} from "@/validation/rawProduct.schema";
import api from "../client";

export type RawProductCategory = { id: string; name: string };
export type RawProductSubCategory = { id: string; name: string };
export type RawProductUnit = { id: string; name: string; symbol: string };

export type RawProduct = {
	id: string;
	name: string;
	unitId: string;
	unit: RawProductUnit;
	totalStock: number;
	currentStock?: number;
	img: string | null;
	description: string | null;
	lowStockAlert: string | null;
	categoryId: string;
	category: RawProductCategory;
	subCategoryId: string | null;
	subCategory: RawProductSubCategory | null;
	createdAt: string;
	updatedAt: string;
	rawProductStocks?: RawProductStock[];
	preparedProductItems?: {
		id: string;
		quantity: number;
		unit: string;
		preparedProduct: { id: string; name: string };
	}[];
};

export type RawProductStock = {
	id: string;
	rawProductId: string;
	rawProduct?: {
		id: string;
		name: string;
		unit: RawProductUnit;
	};
	purchaseId: string | null;
	supplierId: string | null;
	supplier?: { id: string; name: string } | null;
	quantity: number;
	totalCost: number | null;
	batch: string | null;
	lowStockAlert: string | null;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
};

export type RawProductListResponse = {
	data: RawProduct[];
	meta: { total: number; page: number; limit: number; totalPages: number };
};

export type RawProductStockListResponse = {
	data: RawProductStock[];
	meta: { total: number; page: number; limit: number; totalPages: number };
};

export type RawProductQueryParams = {
	page?: number;
	pageSize?: number;
	search?: string;
	categoryId?: string;
	subCategoryId?: string;
};

export type RawProductStockQueryParams = {
	page?: number;
	pageSize?: number;
	search?: string;
	rawProductId?: string;
	supplierId?: string;
};

const getAll = async (
	params: RawProductQueryParams,
): Promise<RawProductListResponse> => {
	const { data } = await api.get("/raw-products", {
		params: {
			page: params.page,
			limit: params.pageSize,
			...(params.search && { search: params.search }),
			...(params.categoryId && { categoryId: params.categoryId }),
			...(params.subCategoryId && { subCategoryId: params.subCategoryId }),
		},
	});
	return data;
};

const getOne = async (id: string): Promise<RawProduct> => {
	const { data } = await api.get(`/raw-products/${id}`);
	return data.data;
};

const create = async (payload: CreateRawProductForm): Promise<RawProduct> => {
	const { data } = await api.post("/raw-products", payload);
	return data.data;
};

const update = async (
	id: string,
	payload: UpdateRawProductForm,
): Promise<RawProduct> => {
	const { data } = await api.patch(`/raw-products/${id}`, payload);
	return data.data;
};

const remove = async (id: string): Promise<void> => {
	await api.delete(`/raw-products/${id}`);
};

const stockIn = async (
	rawProductId: string,
	payload: RawProductStockInForm,
): Promise<RawProductStock> => {
	const { data } = await api.post(
		`/raw-products/${rawProductId}/stock-in`,
		payload,
	);
	return data.data;
};

const getAllStocks = async (
	params: RawProductStockQueryParams,
): Promise<RawProductStockListResponse> => {
	const { data } = await api.get("/raw-products/stocks/all", {
		params: {
			page: params.page,
			limit: params.pageSize,
			...(params.search && { search: params.search }),
			...(params.rawProductId && { rawProductId: params.rawProductId }),
			...(params.supplierId && { supplierId: params.supplierId }),
		},
	});
	return data;
};

export const RawProductApiService = {
	getAll,
	getOne,
	create,
	update,
	remove,
	stockIn,
	getAllStocks,
};
