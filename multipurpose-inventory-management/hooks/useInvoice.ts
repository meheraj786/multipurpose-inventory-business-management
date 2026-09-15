import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	InvoiceApiService,
	type InvoiceQueryParams,
} from "@/lib/api/services/invoice.service";
import type {
	CreateInvoiceForm,
	UpdateInvoiceForm,
} from "@/validation/invoice.schema";

const INVOICE_KEY = "invoices";

export const useGetInvoices = (params: InvoiceQueryParams) =>
	useQuery({
		queryKey: [INVOICE_KEY, params],
		queryFn: () => InvoiceApiService.getAll(params),
	});

export const useGetSingleInvoice = (id: string) =>
	useQuery({
		queryKey: [INVOICE_KEY, id],
		queryFn: () => InvoiceApiService.getOne(id),
		enabled: !!id,
	});

export const useCreateInvoice = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateInvoiceForm) =>
			InvoiceApiService.create(payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [INVOICE_KEY] });
			qc.invalidateQueries({ queryKey: ["sales"] });
		},
	});
};

export const useUpdateInvoice = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...payload }: UpdateInvoiceForm & { id: string }) =>
			InvoiceApiService.update(id, payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICE_KEY] }),
	});
};

export const useDeleteInvoice = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => InvoiceApiService.remove(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICE_KEY] }),
	});
};

export type { Invoice } from "@/lib/api/services/invoice.service";
