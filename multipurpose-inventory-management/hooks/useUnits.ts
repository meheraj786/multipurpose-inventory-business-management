import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/client";

export type Unit = {
	id: string;
	name: string;
	symbol: string;
	group: string;
	conversionFactor: number;
	isBase: boolean;
	isActive: boolean;
};

export type UnitsByGroup = Record<string, Unit[]>;

const UNIT_KEY = "units";

export const useGetUnits = (group?: string) =>
	useQuery({
		queryKey: [UNIT_KEY, group],
		queryFn: async () => {
			const { data } = await api.get("/units", {
				params: group ? { group } : undefined,
			});
			return { data: data.data as Unit[] };
		},
	});

export const useGetUnitsByGroup = () =>
	useQuery({
		queryKey: [UNIT_KEY, "grouped"],
		queryFn: async () => {
			const { data } = await api.get("/units/grouped");
			return data.data as UnitsByGroup;
		},
	});

export const useGetCompatibleUnits = (unitId: string) =>
	useQuery({
		queryKey: [UNIT_KEY, "compatible", unitId],
		queryFn: async () => {
			const { data } = await api.get(`/units/${unitId}/compatible`);
			return data.data as Unit[];
		},
		enabled: !!unitId,
	});
