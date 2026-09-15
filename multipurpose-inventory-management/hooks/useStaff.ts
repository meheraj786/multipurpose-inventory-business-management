import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type StaffQueryParams,
	StaffService,
} from "@/lib/api/services/staff.service";
import type {
	CreateStaffForm,
	PermissionEntry,
	UpdateStaffForm,
} from "@/validation/staff.schema";

const STAFF_KEY = "staff";

export const useGetStaff = (params: StaffQueryParams) =>
	useQuery({
		queryKey: [STAFF_KEY, params],
		queryFn: () => StaffService.getAll(params),
	});

export const useGetSingleStaff = (id: string) =>
	useQuery({
		queryKey: [STAFF_KEY, id],
		queryFn: () => StaffService.getOne(id),
		enabled: !!id,
	});

export const useCreateStaff = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateStaffForm) => StaffService.create(payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: [STAFF_KEY] }),
	});
};

export const useUpdateStaff = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...payload }: UpdateStaffForm & { id: string }) =>
			StaffService.update(id, payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: [STAFF_KEY] }),
	});
};

export const useDeleteStaff = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => StaffService.remove(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: [STAFF_KEY] }),
	});
};

export const useUpdatePermissions = (staffId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (permissions: PermissionEntry[]) =>
			StaffService.updatePermissions(staffId, permissions),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [STAFF_KEY, staffId] });
			qc.invalidateQueries({ queryKey: [STAFF_KEY] });
		},
	});
};

export type { StaffMember } from "@/lib/api/services/staff.service";
