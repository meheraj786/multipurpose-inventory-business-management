import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	type PayDuePayload,
	SaleApiService,
	type SaleQueryParams,
} from "@/lib/api/services/sale.service";
import type { CreateSaleForm, UpdateSaleForm } from "@/validation/sale.schema";

const SALE_KEY = "sales";

export const useGetSales = (params: SaleQueryParams) =>
	useQuery({
		queryKey: [SALE_KEY, params],
		queryFn: () => SaleApiService.getAll(params),
		placeholderData: (prev) => prev,
	});

export const useGetSingleSale = (id: string) =>
	useQuery({
		queryKey: [SALE_KEY, id],
		queryFn: () => SaleApiService.getOne(id),
		enabled: !!id,
	});

export const useCreateSale = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateSaleForm) => SaleApiService.create(payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [SALE_KEY] });
			qc.invalidateQueries({ queryKey: ["products"] });
			qc.invalidateQueries({ queryKey: ["prepared-products"] });
			qc.invalidateQueries({ queryKey: ["invoices"] });
			toast.success("Sale created successfully");
		},
		onError: (e: { response?: { data?: { message?: string } } }) =>
			toast.error(e?.response?.data?.message ?? "Failed to create sale"),
	});
};

export const useUpdateSale = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...payload }: UpdateSaleForm & { id: string }) =>
			SaleApiService.update(id, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [SALE_KEY] });
			toast.success("Sale updated successfully");
		},
		onError: (e: { response?: { data?: { message?: string } } }) =>
			toast.error(e?.response?.data?.message ?? "Failed to update sale"),
	});
};

export const usePayDue = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: PayDuePayload }) =>
			SaleApiService.payDue(id, payload),
		onSuccess: (data) => {
			qc.invalidateQueries({ queryKey: [SALE_KEY] });
			qc.invalidateQueries({ queryKey: ["invoices"] });
			if (data.isDueCleared) {
				toast.success("Due fully cleared! Invoice created.");
			} else {
				toast.success(
					`Payment received. Remaining due: ${data.remainingDue.toFixed(2)}`,
				);
			}
		},
		onError: (e: { response?: { data?: { message?: string } } }) =>
			toast.error(
				e?.response?.data?.message ?? "Failed to process due payment",
			),
	});
};

export const useDeleteSale = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => SaleApiService.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [SALE_KEY] });
			toast.success("Sale deleted");
		},
		onError: () => toast.error("Failed to delete sale"),
	});
};

export type {
	Sale,
	SaleCustomer,
	SaleInvoice,
	SaleItem,
	SaleReturnItem,
	SaleServiceItem,
} from "@/lib/api/services/sale.service";
