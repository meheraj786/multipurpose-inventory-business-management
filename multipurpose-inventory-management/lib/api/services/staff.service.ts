import type {
	CreateStaffForm,
	PermissionEntry,
	UpdateStaffForm,
} from "@/validation/staff.schema";
import api from "../client";

export type StaffMember = {
	id: string;
	email: string;
	name: string | null;
	role: string;
	permissions: { module: string; actions: string[] }[];
	createdAt: string;
};

export type StaffQueryParams = {
	page: number;
	pageSize: number;
	search?: string;
};

export const StaffService = {
	getAll: async (params: StaffQueryParams) => {
		const { data } = await api.get("/staff", {
			params: {
				page: params.page,
				limit: params.pageSize,
				search: params.search,
			},
		});
		return data;
	},
	getOne: async (id: string) => {
		const { data } = await api.get(`/staff/${id}`);
		return data.data;
	},
	create: async (payload: CreateStaffForm) => {
		const { data } = await api.post("/staff", payload);
		return data.data;
	},
	update: async (id: string, payload: UpdateStaffForm) => {
		const { data } = await api.put(`/staff/${id}`, payload);
		return data.data;
	},
	updatePermissions: async (
		staffId: string,
		permissions: PermissionEntry[],
	) => {
		const { data } = await api.put(`/staff/${staffId}/permissions`, {
			permissions,
		});
		return data.data;
	},
	remove: async (id: string) => {
		await api.delete(`/staff/${id}`);
	},
};
