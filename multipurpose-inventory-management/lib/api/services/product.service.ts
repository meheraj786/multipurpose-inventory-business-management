import type {
	CreateProductForm,
	StockInForm,
	UpdateProductForm,
} from "@/validation/product.schema";
import api from "../client";

export type ProductCategory = { id: string; name: string };

export type ProductStock = {
	id: string;
	productId: string;
	quantity: number;
	purchasePrice: number;
	rate: number;
	totalCost: number;
	batch: string | null;
	supplierId: string | null;
	purchaseId: string | null;
	isDeleted: boolean;
	createdAt: string;
	supplier: { id: string; name: string } | null;
};

export type ProductSaleItem = {
	id: string;
	quantity: number;
	sellPrice: number;
	discount: number;
	createdAt: string;
	sale: {
		id: string;
		createdAt: string;
		paymentMethod: string;
		customer: { id: string; name: string; phone: string } | null;
	};
};

export type Product = {
	id: string;
	name: string;
	description: string | null;
	sku: string | null;
	tax: number | null;
	defaultPurchasePrice: number | null;
	defaultSalePrice: number | null;
	lowStockAlert: string | null;
	img: string | null;
	categoryId: string;
	subCategoryId: string | null;
	unitId?: string | null;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
	category: ProductCategory;
	subCategory: ProductCategory | null;
	totalStock?: number;
	productStocks?: ProductStock[];
	saleItems?: ProductSaleItem[];
};

export type ProductListResponse = {
	data: Product[];
	meta: { total: number; page: number; limit: number; totalPages: number };
};

export type ProductQueryParams = {
	page?: number;
	pageSize?: number;
	search?: string;
	q?: string;
	categoryId?: string;
	subCategoryId?: string;
};

export type StockSummary = {
	totalStock: number;
	totalCost: number;
	avgPurchasePrice: number;
};

const getAll = async (
	params: ProductQueryParams,
): Promise<ProductListResponse> => {
	const { data } = await api.get("/products", { params });
	return data;
};

const getOne = async (id: string): Promise<Product> => {
	const { data } = await api.get(`/products/${id}`);
	return data.data;
};

const create = async (payload: CreateProductForm): Promise<Product> => {
	const { data } = await api.post("/products", payload);
	return data.data;
};

const update = async (
	id: string,
	payload: UpdateProductForm,
): Promise<Product> => {
	const { data } = await api.patch(`/products/${id}`, payload);
	return data.data;
};

const remove = async (id: string): Promise<void> => {
	await api.delete(`/products/${id}`);
};

const stockIn = async (
	productId: string,
	payload: StockInForm,
): Promise<ProductStock> => {
	const { data } = await api.post(`/products/${productId}/stock-in`, payload);
	return data.data;
};

const getStockSummary = async (productId: string): Promise<StockSummary> => {
	const { data } = await api.get(`/products/${productId}/stock-summary`);
	return data.data;
};

export const ProductApiService = {
	getAll,
	getOne,
	create,
	update,
	remove,
	stockIn,
	getStockSummary,
};
