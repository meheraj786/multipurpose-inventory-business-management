import { z } from "zod";

export const returnItemSchema = z
	.object({
		itemType: z.enum(["PRODUCT", "PREPARED_PRODUCT"]),
		productId: z.string().optional(),
		preparedProductId: z.string().optional(),
		quantity: z.number().positive("Quantity must be positive"),
	})
	.refine(
		(item) =>
			item.itemType === "PRODUCT" ? !!item.productId : !!item.preparedProductId,
		{
			message: "Missing item reference for the selected item type",
			path: ["productId"],
		},
	);

export const createCustomerReturnSchema = z.object({
	saleId: z.string().min(1, "Sale ID is required"),
	items: z.array(returnItemSchema).min(1, "At least one item is required"),
	restocked: z.boolean().optional(),
	reason: z.string().optional(),
});

export const updateCustomerReturnSchema = z.object({
	reason: z.string().optional(),
});

export type CreateCustomerReturnInput = z.infer<
	typeof createCustomerReturnSchema
>;
export type UpdateCustomerReturnInput = z.infer<
	typeof updateCustomerReturnSchema
>;

export interface CustomerReturnDetail {
	id: string;
	saleId: string;
	itemType: "PRODUCT" | "PREPARED_PRODUCT";
	productId?: string | null;
	preparedProductId?: string | null;
	quantity: number;
	refundAmount: number;
	excessRefundAmount: number;
	requiresManualRefund: boolean;
	excessAmount: number;
	restocked: boolean;
	reason?: string | null;
	createdAt: string;
	product?: { name: string } | null;
	preparedProduct?: { name: string } | null;
}

export interface PaginatedReturnResponse {
	data: CustomerReturnDetail[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}
