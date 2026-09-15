import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
	PurchaseQueryParams,
	RecordPaymentInput,
	UpdatePurchaseInput,
} from "@/lib/api/services/purchase.service";
import { PurchaseApiService } from "@/lib/api/services/purchase.service";
import type { CreatePurchaseForm } from "@/validation/purchase.schema";

const KEY = "purchases";
const DUES_KEY = "purchase-dues";

export const useGetPurchases = (params: PurchaseQueryParams) =>
	useQuery({
		queryKey: [KEY, params],
		queryFn: () => PurchaseApiService.getAll(params),
		placeholderData: (prev) => prev,
	});

export const useGetPurchase = (id = "") =>
	useQuery({
		queryKey: [KEY, id],
		queryFn: () => PurchaseApiService.getOne(id),
		enabled: !!id,
	});

export const useGetPurchasePayments = (purchaseId = "") =>
	useQuery({
		queryKey: [KEY, purchaseId, "payments"],
		queryFn: () => PurchaseApiService.getPayments(purchaseId),
		enabled: !!purchaseId,
	});

export const useGetDueSummary = () =>
	useQuery({
		queryKey: [DUES_KEY, "summary"],
		queryFn: () => PurchaseApiService.getDueSummary(),
	});

export const useGetSupplierDueSummary = () =>
	useQuery({
		queryKey: [DUES_KEY, "suppliers"],
		queryFn: () => PurchaseApiService.getSupplierDueSummary(),
	});

export const useGetSupplierLedger = (supplierId = "", onlyUnpaid = false) =>
	useQuery({
		queryKey: [DUES_KEY, "suppliers", supplierId, onlyUnpaid],
		queryFn: () => PurchaseApiService.getSupplierLedger(supplierId, onlyUnpaid),
		enabled: !!supplierId,
	});

export const useCreatePurchase = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreatePurchaseForm) =>
			PurchaseApiService.create(payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [KEY] });
			qc.invalidateQueries({ queryKey: [DUES_KEY] });
			qc.invalidateQueries({ queryKey: ["products"] });
			qc.invalidateQueries({ queryKey: ["suppliers"] });
			toast.success("Purchase created successfully");
		},
		onError: (e: { response?: { data?: { message?: string } } }) =>
			toast.error(e?.response?.data?.message ?? "Failed to create purchase"),
	});
};

export const useUpdatePurchase = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: UpdatePurchaseInput;
		}) => PurchaseApiService.update(id, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [KEY] });
			qc.invalidateQueries({ queryKey: [DUES_KEY] });
			qc.invalidateQueries({ queryKey: ["products"] });
			qc.invalidateQueries({ queryKey: ["suppliers"] });
			toast.success("Purchase updated successfully");
		},
		onError: (e: { response?: { data?: { message?: string } } }) =>
			toast.error(e?.response?.data?.message ?? "Failed to update purchase"),
	});
};

export const useDeletePurchase = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => PurchaseApiService.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [KEY] });
			qc.invalidateQueries({ queryKey: [DUES_KEY] });
			toast.success("Purchase deleted");
		},
		onError: (e: { response?: { data?: { message?: string } } }) =>
			toast.error(e?.response?.data?.message ?? "Failed to delete purchase"),
	});
};

export const useRestorePurchase = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => PurchaseApiService.restore(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [KEY] });
			qc.invalidateQueries({ queryKey: [DUES_KEY] });
			toast.success("Purchase restored");
		},
		onError: (e: { response?: { data?: { message?: string } } }) =>
			toast.error(e?.response?.data?.message ?? "Failed to restore purchase"),
	});
};

export const useRecordPurchasePayment = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			purchaseId,
			payload,
		}: {
			purchaseId: string;
			payload: RecordPaymentInput;
		}) => PurchaseApiService.recordPayment(purchaseId, payload),
		onSuccess: (_data, variables) => {
			qc.invalidateQueries({ queryKey: [KEY] });
			qc.invalidateQueries({ queryKey: [KEY, variables.purchaseId] });
			qc.invalidateQueries({
				queryKey: [KEY, variables.purchaseId, "payments"],
			});
			qc.invalidateQueries({ queryKey: [DUES_KEY] });
			toast.success("Payment recorded");
		},
		onError: (e: { response?: { data?: { message?: string } } }) =>
			toast.error(e?.response?.data?.message ?? "Failed to record payment"),
	});
};

export const useCreatePurchaseWithPayment = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (values: CreatePurchaseForm) => {
			const created = await PurchaseApiService.create(values);

			if (values.paymentOption !== "DUE" && values.paymentAmount) {
				let remaining = values.paymentAmount;
				for (const purchase of created) {
					if (remaining <= 0) break;
					const purchaseDue = Number(purchase.due);
					if (purchaseDue <= 0) continue;
					const amountForThis = Math.min(remaining, purchaseDue);
					await PurchaseApiService.recordPayment(purchase.id, {
						amount: amountForThis,
						method: values.paymentMethod,
						note: values.paymentNote || null,
					});
					remaining -= amountForThis;
				}
			}

			return created;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [KEY] });
			qc.invalidateQueries({ queryKey: [DUES_KEY] });
			qc.invalidateQueries({ queryKey: ["products"] });
			qc.invalidateQueries({ queryKey: ["suppliers"] });
			toast.success("Purchase created successfully");
		},
		onError: (e: { response?: { data?: { message?: string } } }) =>
			toast.error(e?.response?.data?.message ?? "Failed to create purchase"),
	});
};

export type {
	DueSummary,
	Purchase,
	PurchasePayment,
	SupplierDueSummary,
} from "@/lib/api/services/purchase.service";
