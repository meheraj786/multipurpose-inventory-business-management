import type { PaginationParams } from "@/components/data-table";
import type {
	CreateCustomerForm,
	CustomerData,
	UpdateCustomerForm,
} from "@/validation/customer.schema";
import api from "../client";
import type { Sale } from "./sale.service";

export type CustomerPayload = CreateCustomerForm;
export type UpdateCustomerPayload = UpdateCustomerForm;

export type CustomerWithSales = CustomerData & {
	sales: Sale[];
};

export type PaginatedCustomerResponse = {
	data: CustomerData[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

const buildParams = (params: PaginationParams) => ({
	page: params.page,
	pageSize: params.pageSize,
	...(params.search && { search: params.search }),
});

export const customerService = {
	getAll: async (
		params: PaginationParams,
	): Promise<PaginatedCustomerResponse> => {
		const res = await api.get("/customers", { params: buildParams(params) });
		const { data, meta } = res.data;
		return {
			data,
			total: meta.total,
			page: meta.page,
			pageSize: meta.limit,
			totalPages: meta.totalPage,
		};
	},

	getOne: async (id: string): Promise<CustomerWithSales> => {
		const res = await api.get(`/customers/${id}`);
		return res.data.data;
	},

	create: async (payload: CustomerPayload): Promise<CustomerData> => {
		const res = await api.post("/customers", payload);
		return res.data.data;
	},

	update: async (
		id: string,
		payload: UpdateCustomerPayload,
	): Promise<CustomerData> => {
		const res = await api.patch(`/customers/${id}`, payload);
		return res.data.data;
	},

	delete: async (id: string): Promise<void> => {
		await api.delete(`/customers/${id}`);
	},
};
