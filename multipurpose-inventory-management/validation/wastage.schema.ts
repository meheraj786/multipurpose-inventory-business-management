import { z } from "zod";

export const createWastageSchema = z.object({
	productId: z.string().optional(),
	rawProductId: z.string().optional(),
	preparedProductId: z.string().optional(),
	quantity: z.number().positive("Quantity must be positive"),
	reason: z.string().min(1, "Reason is required"),
	notes: z.string().optional(),
});

export const updateWastageSchema = z.object({
	reason: z.string().min(1).optional(),
	notes: z.string().optional(),
});

export type CreateWastageInput = z.infer<typeof createWastageSchema>;
export type UpdateWastageInput = z.infer<typeof updateWastageSchema>;

export interface WastageDetail {
	id: string;
	productId?: string | null;
	rawProductId?: string | null;
	preparedProductId?: string | null;
	quantity: number;
	reason: string;
	notes?: string | null;
	createdAt: string;
	product?: { name: string } | null;
	rawProduct?: { name: string } | null;
	preparedProduct?: { name: string } | null;
}

export interface PaginatedWastageResponse {
	data: WastageDetail[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}
