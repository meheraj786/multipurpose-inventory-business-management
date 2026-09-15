import type { CreateSupplierForm } from "@/validation/supplier.schema";
import api from "../client";
import type { Purchase, PurchaseStock } from "./purchase.service";

export type Supplier = {
	id: string;
	name: string;
	contact: string;
	email?: string | null;
	companyName?: string | null;
	address?: string | null;
	categoryId?: string | null;
	category?: { id: string; name: string } | null;
	isActive: boolean;
	isDeleted: boolean;
	accountId: string;
	createdAt: string;
	updatedAt: string;
	_count?: { purchases: number; productStocks: number };
	purchases?: Purchase[];
	productStocks?: PurchaseStock[];
	totalPurchaseValue?: number;
	totalPaid?: number;
	totalDue?: number;
	unpaidPurchaseCount?: number;
};

export type SupplierListResponse = {
	data: Supplier[];
	meta: { total: number; page: number; limit: number; totalPages: number };
};

export type SupplierQueryParams = {
	page?: number;
	pageSize?: number;
	search?: string;
	categoryId?: string;
	isActive?: boolean;
	hasDue?: boolean;
};

const getAll = async (
	params: SupplierQueryParams,
): Promise<SupplierListResponse> => {
	const { data } = await api.get("/suppliers", {
		params: {
			page: params.page,
			limit: params.pageSize,
			...(params.search && { search: params.search }),
			...(params.categoryId && { categoryId: params.categoryId }),
			...(params.isActive !== undefined && { isActive: params.isActive }),
			...(params.hasDue && { hasDue: true }),
		},
	});
	return data;
};

const getOne = async (id: string): Promise<Supplier> => {
	const { data } = await api.get(`/suppliers/${id}`);
	return data.data;
};

const create = async (payload: CreateSupplierForm): Promise<Supplier> => {
	const { data } = await api.post("/suppliers", payload);
	return data.data;
};

const update = async (
	id: string,
	payload: Partial<CreateSupplierForm>,
): Promise<Supplier> => {
	const { data } = await api.patch(`/suppliers/${id}`, payload);
	return data.data;
};

const remove = async (id: string): Promise<void> => {
	await api.delete(`/suppliers/${id}`);
};

const toggleActive = async (id: string): Promise<Supplier> => {
	const { data } = await api.patch(`/suppliers/${id}/toggle-active`);
	return data.data;
};

export const SupplierApiService = {
	getAll,
	getOne,
	create,
	update,
	remove,
	toggleActive,
};
