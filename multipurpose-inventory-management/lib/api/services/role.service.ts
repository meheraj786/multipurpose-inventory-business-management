import type { RoleForm } from "@/validation/role.schema";
import api from "../client";

export type Role = {
	id: string;
	name: string;
	description: string | null;
	accountId: string;
	permissions: (RoleForm["permissions"][number] & { id: string })[];
	_count?: { users: number };
	createdAt: string;
	updatedAt: string;
};

const getAll = async (): Promise<Role[]> => {
	const { data } = await api.get("/roles");
	return data.data;
};

const create = async (payload: RoleForm): Promise<Role> => {
	const { data } = await api.post("/roles", payload);
	return data.data;
};

const update = async (
	id: string,
	payload: Partial<RoleForm>,
): Promise<Role> => {
	const { data } = await api.patch(`/roles/${id}`, payload);
	return data.data;
};

const remove = async (id: string): Promise<void> => {
	await api.delete(`/roles/${id}`);
};

export const RoleService = { getAll, create, update, remove };
