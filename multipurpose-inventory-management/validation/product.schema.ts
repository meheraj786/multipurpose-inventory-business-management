import * as z from "zod";

const optionalPrice = z
	.union([z.number(), z.string()])
	.optional()
	.transform((val) => {
		if (val === "" || val === null || val === undefined) return undefined;
		const num = Number(val);
		return Number.isNaN(num) ? undefined : num;
	})
	.pipe(z.number().min(0).optional());

export const createProductSchema = z.object({
	unitId: z.string().optional(),
	name: z.string().min(2, "Name must be at least 2 characters").max(100),
	description: z.string().optional(),
	sku: z.string().optional(),
	tax: optionalPrice,
	defaultSalePrice: optionalPrice,
	lowStockAlert: z.string().optional(),
	categoryId: z.string().min(1, "Category is required"),
	subCategoryId: z.string().optional(),
	img: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const stockInSchema = z.object({
	quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
	purchasePrice: z.coerce.number().min(0, "Purchase price cannot be negative"),
	rate: z.coerce.number().min(0, "Rate cannot be negative"),
	supplierId: z.string().optional(),
	batch: z.string().optional(),
});

export type CreateProductForm = z.infer<typeof createProductSchema>;
export type CreateProductInput = z.input<typeof createProductSchema>;
export type UpdateProductForm = z.infer<typeof updateProductSchema>;
export type StockInForm = z.infer<typeof stockInSchema>;
