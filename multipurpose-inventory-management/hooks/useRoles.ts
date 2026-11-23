import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RoleService } from "@/lib/api/services/role.service";
import type { RoleForm } from "@/validation/role.schema";

const ROLES_KEY = ["roles"];

export const useGetRoles = () =>
	useQuery({ queryKey: ROLES_KEY, queryFn: RoleService.getAll });

export const useCreateRole = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: RoleForm) => RoleService.create(payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLES_KEY }),
	});
};

export const useUpdateRole = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...payload }: Partial<RoleForm> & { id: string }) =>
			RoleService.update(id, payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLES_KEY }),
	});
};

export const useDeleteRole = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => RoleService.remove(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLES_KEY }),
	});
};

export type { Role } from "@/lib/api/services/role.service";
