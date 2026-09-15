import type {
	CreateServiceForm,
	UpdateServiceForm,
} from "@/validation/service.schema";
import api from "../client";

export type ServiceCategory = {
	id: string;
	name: string;
};

export type Service = {
	id: string;
	name: string;
	internalCost: number | null;
	salePrice: number;
	description: string | null;
	categoryId: string;
	subCategoryId: string | null;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
	category: ServiceCategory;
	subCategory: ServiceCategory | null;
	saleServices?: SaleService[];
};

export type SaleService = {
	id: string;
	saleId: string;
	quantity: number;
	unitPrice: number;
	discount: number;
	total: number;
	createdAt: string;
	sale: {
		id: string;
		createdAt: string;
		paymentMethod: string;
		customer: { id: string; name: string; phone: string } | null;
	};
};

export type ServiceListResponse = {
	data: Service[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
};

export type ServiceQueryParams = {
	page?: number;
	pageSize?: number;
	search?: string;
	categoryId?: string;
	subCategoryId?: string;
};

const getAll = async (
	params: ServiceQueryParams,
): Promise<ServiceListResponse> => {
	const { data } = await api.get("/services", { params });
	return data;
};

const getOne = async (id: string): Promise<Service> => {
	const { data } = await api.get(`/services/${id}`);
	return data.data;
};

const create = async (payload: CreateServiceForm): Promise<Service> => {
	const { data } = await api.post("/services", payload);
	return data.data;
};

const update = async (
	id: string,
	payload: UpdateServiceForm,
): Promise<Service> => {
	const { data } = await api.patch(`/services/${id}`, payload);
	return data.data;
};

const remove = async (id: string): Promise<void> => {
	await api.delete(`/services/${id}`);
};

export const ServiceApiService = {
	getAll,
	getOne,
	create,
	update,
	remove,
};
