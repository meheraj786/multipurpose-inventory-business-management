import * as z from "zod";

export const createRawProductSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters").max(100),
	unitId: z.string().min(1, "Unit is required"),
	description: z.string().optional(),
	img: z.string().optional(),
	lowStockAlert: z.string().optional(),
	categoryId: z.string().min(1, "Category is required"),
	subCategoryId: z.string().optional(),
});

export const updateRawProductSchema = createRawProductSchema.partial();

export const rawProductStockInSchema = z.object({
	quantity: z.coerce.number().positive("Quantity must be positive"),
	totalCost: z.coerce.number().min(0).optional(),
	// supplierId removed
	purchaseId: z.string().optional(),
	batch: z.string().optional(),
});

export type CreateRawProductForm = z.infer<typeof createRawProductSchema>;
export type UpdateRawProductForm = z.infer<typeof updateRawProductSchema>;
export type RawProductStockInForm = z.infer<typeof rawProductStockInSchema>;
