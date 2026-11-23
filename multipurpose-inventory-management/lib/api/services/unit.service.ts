import api from "../client";

export type Unit = {
	id: string;
	name: string;
	symbol: string;
	group?: string | null;
};

const getAll = async (params = { page: 1, pageSize: 100 }) => {
	const { data } = await api.get(`/units`, { params });
	return data;
};

export const UnitApiService = { getAll };
