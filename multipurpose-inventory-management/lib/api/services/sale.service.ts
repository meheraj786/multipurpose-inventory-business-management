import type {
	CreateSaleForm,
	PaymentEntryForm,
	SaleItemType,
	UpdateSaleForm,
} from "@/validation/sale.schema";
import api from "../client";

export type SaleProduct = {
	id: string;
	name: string;
	sku: string | null;
};

export type SalePreparedProduct = {
	id: string;
	name: string;
};

export type SaleItem = {
	id: string;
	saleId: string;
	itemType: SaleItemType;
	profit?: number;
	productId: string | null;
	preparedProductId: string | null;
	unitId: string;
	quantity: number;
	purchasePrice: number;
	sellPrice: number;
	discount: number;
	createdAt: string;
	product: SaleProduct | null;
	preparedProduct: SalePreparedProduct | null;
};

export type SaleServiceItem = {
	id: string;
	saleId: string;
	serviceId: string;
	quantity: number;
	unitPrice: number;
	profit?: number;
	discount: number;
	total: number;
	service: { id: string; name: string; internalCost: number | null } | null;
};

export type SaleCustomer = {
	id: string;
	name: string;
	email: string | null;
	phone: string;
	address: string | null;
};

export type SaleInvoice = {
	id: string;
	billTo: string;
	invoiceDate: string;
	saleId: string;
	status: string;
	grandTotal: number;
	createdAt: string;
};

export type SaleListResponse = {
	data: Sale[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
};

export type PayDuePayload = {
	amountPaid: number;
	paymentMethod: string;
	transactionId?: string;
	notes?: string;
};

export type PayDueResponse = {
	sale: Sale;
	invoice: SaleInvoice;
	amountPaid: number;
	remainingDue: number;
	isDueCleared: boolean;
};

export type SaleQueryParams = {
	page?: number;
	pageSize?: number;
	search?: string;
	startDate?: string;
	endDate?: string;
	dueOnly?: boolean;
};

export type SaleReturnItem = {
	id: string;
	saleId: string;
	itemType: SaleItemType;
	productId: string | null;
	preparedProductId: string | null;
	quantity: number;
	refundAmount: number;
	excessRefundAmount: number;
	requiresManualRefund: boolean;
	restocked: boolean;
	reason: string | null;
	createdAt: string;
	updatedAt: string;
	product: SaleProduct | null;
	preparedProduct: SalePreparedProduct | null;
};

export type Sale = {
	id: string;
	customerId: string | null;
	customerNumber: string | null;
	paymentMethod: string;
	payments: PaymentEntryForm[] | null;
	discount: number;
	due: number;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
	profit?: number;
	customer: SaleCustomer | null;
	saleItems: SaleItem[];
	saleServices: SaleServiceItem[];
	invoices?: SaleInvoice[];
	customerReturns?: SaleReturnItem[];
};

export type SaleFinancials = {
	baseGrandTotal: number;
	adjustedGrandTotal: number;
	baseProfit: number;
	adjustedProfit: number;
	totalPaid: number;
	totalReturnedAmount: number;
};

export const calculateSaleFinancials = (sale: Sale): SaleFinancials => {
	const baseItemSubtotal = (sale.saleItems || []).reduce((sum, item) => {
		const quantity = Number(item.quantity ?? 0);
		const lineRevenue = Number(item.sellPrice ?? 0) * quantity;
		const lineDiscount = Number(item.discount ?? 0);
		return sum + Math.max(0, lineRevenue - lineDiscount);
	}, 0);

	const baseServiceSubtotal = (sale.saleServices || []).reduce(
		(sum, service) => sum + Number(service.total ?? 0),
		0,
	);

	const baseGrandTotal = Math.max(
		0,
		baseItemSubtotal + baseServiceSubtotal - Number(sale.discount ?? 0),
	);

	const totalReturnedAmount = (sale.customerReturns || []).reduce(
		(sum, returnItem) => sum + Number(returnItem.refundAmount ?? 0),
		0,
	);

	const adjustedGrandTotal = Math.max(0, baseGrandTotal - totalReturnedAmount);

	const baseItemProfit = (sale.saleItems || []).reduce((sum, item) => {
		const quantity = Number(item.quantity ?? 0);
		if (quantity <= 0) return sum;
		const lineRevenue = Number(item.sellPrice ?? 0) * quantity;
		const lineCost = Number(item.purchasePrice ?? 0) * quantity;
		const lineDiscount = Number(item.discount ?? 0);
		return sum + lineRevenue - lineCost - lineDiscount;
	}, 0);

	const baseServiceProfit = (sale.saleServices || []).reduce((sum, service) => {
		const quantity = Number(service.quantity ?? 1);
		const revenue = Number(service.total ?? 0);
		const internalCost = Number(service.service?.internalCost ?? 0);
		return sum + revenue - internalCost * quantity;
	}, 0);

	const baseProfit =
		baseItemProfit + baseServiceProfit - Number(sale.discount ?? 0);

	const returnedProfit = (sale.saleItems || []).reduce((sum, item) => {
		const quantity = Number(item.quantity ?? 0);
		if (quantity <= 0) return sum;

		const lineProfit =
			Number(item.sellPrice ?? 0) * quantity -
			Number(item.purchasePrice ?? 0) * quantity -
			Number(item.discount ?? 0);

		const returnedQuantity = (sale.customerReturns || []).reduce(
			(returnQty, returnItem) => {
				if (
					returnItem.itemType !== item.itemType ||
					returnItem.productId !== item.productId ||
					returnItem.preparedProductId !== item.preparedProductId
				) {
					return returnQty;
				}
				return returnQty + Number(returnItem.quantity ?? 0);
			},
			0,
		);

		if (returnedQuantity <= 0) return sum;
		return sum + (lineProfit / quantity) * returnedQuantity;
	}, 0);

	const adjustedProfit = baseProfit - returnedProfit;
	const totalPaid = Math.max(0, adjustedGrandTotal - Number(sale.due ?? 0));

	return {
		baseGrandTotal,
		adjustedGrandTotal,
		baseProfit,
		adjustedProfit,
		totalPaid,
		totalReturnedAmount,
	};
};

const getAll = async (params: SaleQueryParams): Promise<SaleListResponse> => {
	const { data } = await api.get("/sales", {
		params: {
			page: params.page,
			limit: params.pageSize,
			search: params.search,
			startDate: params.startDate,
			endDate: params.endDate,
			dueOnly: params.dueOnly ? true : undefined,
		},
	});
	return data;
};

const getOne = async (id: string): Promise<Sale> => {
	const { data } = await api.get(`/sales/${id}`);
	return data.data;
};

const create = async (payload: CreateSaleForm): Promise<Sale> => {
	const { data } = await api.post("/sales", payload);
	return data.data;
};

const update = async (id: string, payload: UpdateSaleForm): Promise<Sale> => {
	const { data } = await api.patch(`/sales/${id}`, payload);
	return data.data;
};

const payDue = async (
	id: string,
	payload: PayDuePayload,
): Promise<PayDueResponse> => {
	const { data } = await api.post(`/sales/${id}/pay-due`, payload);
	return data.data;
};

const remove = async (id: string): Promise<void> => {
	await api.delete(`/sales/${id}`);
};

export const SaleApiService = {
	getAll,
	getOne,
	create,
	update,
	payDue,
	remove,
};
