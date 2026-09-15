import type { CreatePurchaseForm } from "@/validation/purchase.schema";
import api from "../client";

export type PaymentMethod =
	| "CASH"
	| "CARD"
	| "MOBILE_BANKING"
	| "CREDIT"
	| "CASH_AND_CARD"
	| "CASH_AND_MOBILE_BANKING"
	| "CASH_AND_CREDIT"
	| "CARD_AND_MOBILE_BANKING"
	| "CARD_AND_CREDIT"
	| "MOBILE_BANKING_AND_CREDIT";

export type PurchasePaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export type PurchaseStock = {
	id: string;
	productId: string | null;
	product?: { id: string; name: string; unit?: { symbol: string } } | null;
	supplier?: { id: string; name: string } | null;
	unitId: string;
	unit?: { id: string; symbol: string; name: string } | null;
	quantity: number;
	purchasePrice: number;
	rate: number;
	totalCost: number;
	batch?: string | null;
	createdAt: string;
};

export type PurchasePayment = {
	id: string;
	purchaseId: string;
	amount: number;
	method: PaymentMethod;
	note?: string | null;
	paidAt: string;
	createdAt: string;
};

export type Purchase = {
	id: string;
	productId?: string | null;
	supplierId?: string | null;
	supplier?: {
		id: string;
		name: string;
		contact?: string;
		email?: string | null;
	} | null;
	qty: number;
	purchasePrice: number;
	rate: number;
	totalCost: number;
	paidAmount: number;
	due: number;
	paymentStatus: PurchasePaymentStatus;
	notes?: string | null;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
	productStocks?: PurchaseStock[];
	payments?: PurchasePayment[];
};

export type PurchaseListResponse = {
	data: Purchase[];
	meta: { total: number; page: number; limit: number; totalPages: number };
};

export type UpdatePurchaseInput = {
	supplierId?: string | null;
	qty?: number;
	purchasePrice?: number;
	rate?: number;
	notes?: string | null;
};

export type RecordPaymentInput = {
	amount: number;
	method?: PaymentMethod;
	note?: string | null;
	paidAt?: string;
};

export type DueSummary = {
	totalPurchased: number;
	totalPaid: number;
	totalDue: number;
	unpaidPurchaseCount: number;
};

export type SupplierDueSummary = {
	supplier: {
		id: string;
		name: string;
		contact: string;
		email?: string | null;
	} | null;
	totalDue: number;
	totalPurchased: number;
	totalPaid: number;
	unpaidPurchaseCount: number;
};

export type PurchaseQueryParams = {
	page?: number;
	pageSize?: number;
	search?: string;
	paymentStatus?: PurchasePaymentStatus;
	dueOnly?: boolean;
	startDate?: string;
	endDate?: string;
};

const getAll = async (
	params: PurchaseQueryParams,
): Promise<PurchaseListResponse> => {
	const { data } = await api.get("/purchases", {
		params: {
			page: params.page,
			limit: params.pageSize,
			...(params.search && { search: params.search }),
			...(params.paymentStatus && { paymentStatus: params.paymentStatus }),
			...(params.dueOnly && { dueOnly: true }),
			...(params.startDate && { startDate: params.startDate }),
			...(params.endDate && { endDate: params.endDate }),
		},
	});
	return data;
};

const getOne = async (id: string): Promise<Purchase> => {
	const { data } = await api.get(`/purchases/${id}`);
	return data.data;
};

const create = async (payload: CreatePurchaseForm): Promise<Purchase[]> => {
	const { data } = await api.post("/purchases", {
		supplierId: payload.supplierId || null,
		items: payload.items,
		notes: payload.notes || null,
	});
	return data.data;
};

const update = async (
	id: string,
	payload: UpdatePurchaseInput,
): Promise<Purchase> => {
	const { data } = await api.patch(`/purchases/${id}`, payload);
	return data.data;
};

const remove = async (id: string): Promise<void> => {
	await api.delete(`/purchases/${id}`);
};

const restore = async (id: string): Promise<Purchase> => {
	const { data } = await api.patch(`/purchases/${id}/restore`);
	return data.data;
};

const getPayments = async (purchaseId: string): Promise<PurchasePayment[]> => {
	const { data } = await api.get(`/purchases/${purchaseId}/payments`);
	return data.data;
};

const recordPayment = async (
	purchaseId: string,
	payload: RecordPaymentInput,
): Promise<{ purchase: Purchase; payment: PurchasePayment }> => {
	const { data } = await api.post(`/purchases/${purchaseId}/payments`, payload);
	return data.data;
};

const getDueSummary = async (): Promise<DueSummary> => {
	const { data } = await api.get("/purchases/dues/summary");
	return data.data;
};

const getSupplierDueSummary = async (): Promise<SupplierDueSummary[]> => {
	const { data } = await api.get("/purchases/dues/suppliers");
	return data.data;
};

const getSupplierLedger = async (
	supplierId: string,
	onlyUnpaid = false,
): Promise<Purchase[]> => {
	const { data } = await api.get(`/purchases/dues/suppliers/${supplierId}`, {
		params: { onlyUnpaid },
	});
	return data.data;
};

export const PurchaseApiService = {
	getAll,
	getOne,
	create,
	update,
	remove,
	restore,
	getPayments,
	recordPayment,
	getDueSummary,
	getSupplierDueSummary,
	getSupplierLedger,
};
