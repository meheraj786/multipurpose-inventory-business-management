import type {
	CreateInvoiceForm,
	UpdateInvoiceForm,
} from "@/validation/invoice.schema";
import api from "../client";

export type Invoice = {
	id: string;
	billTo: string;
	invoiceDate: string;
	saleId: string;
	status: string;
	grandTotal: number;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
	sale?: {
		id: string;
		paymentMethod: string;
		discount: number;
		due: number;
		customer: { id: string; name: string; phone: string } | null;
		customerNumber: string | null;
	};
};

export type InvoiceListResponse = {
	data: Invoice[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
};

export type InvoiceQueryParams = {
	page?: number;
	pageSize?: number;
	search?: string;
	status?: string;
};

const getAll = async (
	params: InvoiceQueryParams,
): Promise<InvoiceListResponse> => {
	const { data } = await api.get("/invoices", { params });
	return data;
};

const getOne = async (id: string): Promise<Invoice> => {
	const { data } = await api.get(`/invoices/${id}`);
	return data.data;
};

const create = async (payload: CreateInvoiceForm): Promise<Invoice> => {
	const { data } = await api.post("/invoices", payload);
	return data.data;
};

const update = async (
	id: string,
	payload: UpdateInvoiceForm,
): Promise<Invoice> => {
	const { data } = await api.patch(`/invoices/${id}`, payload);
	return data.data;
};

const remove = async (id: string): Promise<void> => {
	await api.delete(`/invoices/${id}`);
};

export const InvoiceApiService = {
	getAll,
	getOne,
	create,
	update,
	remove,
};
