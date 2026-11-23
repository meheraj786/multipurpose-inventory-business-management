import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SupplierQueryParams } from "@/lib/api/services/supplier.service";
import { SupplierApiService } from "@/lib/api/services/supplier.service";
import type { CreateSupplierForm } from "@/validation/supplier.schema";

const KEY = "suppliers";

export const useGetSuppliers = (params: SupplierQueryParams) =>
	useQuery({
		queryKey: [KEY, params],
		queryFn: () => SupplierApiService.getAll(params),
		placeholderData: (prev) => prev,
	});

export const useGetSupplier = (id = "") =>
	useQuery({
		queryKey: [KEY, id],
		queryFn: () => SupplierApiService.getOne(id),
		enabled: !!id,
	});

export const useCreateSupplier = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateSupplierForm) =>
			SupplierApiService.create(payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [KEY] });
			toast.success("Supplier created");
		},
		onError: () => toast.error("Failed to create supplier"),
	});
};

export const useUpdateSupplier = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: Partial<CreateSupplierForm>;
		}) => SupplierApiService.update(id, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [KEY] });
			toast.success("Supplier updated");
		},
		onError: () => toast.error("Failed to update supplier"),
	});
};

export const useToggleSupplierActive = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => SupplierApiService.toggleActive(id),
		onSuccess: (data) => {
			qc.invalidateQueries({ queryKey: [KEY] });
			toast.success(`Supplier ${data.isActive ? "activated" : "deactivated"}`);
		},
		onError: () => toast.error("Failed to update status"),
	});
};

export const useDeleteSupplier = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => SupplierApiService.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [KEY] });
			toast.success("Supplier moved to trash");
		},
		onError: (e: { response?: { data?: { message?: string } } }) =>
			toast.error(e?.response?.data?.message ?? "Failed to delete supplier"),
	});
};

export type { Supplier } from "@/lib/api/services/supplier.service";
