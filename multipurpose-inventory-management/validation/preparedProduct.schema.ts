import * as z from "zod";

const preparedProductItemSchema = z.object({
	rawProductId: z.string().min(1, "Raw product is required"),
	quantity: z.coerce.number().positive("Quantity must be positive"),
	unit: z.string().min(1, "Unit is required"),
});

export const createPreparedProductSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters").max(100),
	unitId: z.string().min(1, "Unit is required"),
	categoryId: z.string().min(1, "Category is required"),
	subCategoryId: z.string().optional(),
	rawMaterialCost: z.coerce.number().min(0).optional(),
	defaultSalePrice: z.coerce.number().min(0).optional(),
	description: z.string().optional(),
	img: z.string().optional(),
	items: z
		.array(preparedProductItemSchema)
		.min(1, "Recipe must have at least one ingredient"),
});

export const updatePreparedProductSchema = createPreparedProductSchema
	.partial()
	.extend({
		items: z.array(preparedProductItemSchema).optional(),
	});

export const produceStockSchema = z.object({
	quantity: z.coerce.number().positive("Quantity must be positive"),
});

export type PreparedProductItemForm = z.infer<typeof preparedProductItemSchema>;
export type CreatePreparedProductForm = z.infer<
	typeof createPreparedProductSchema
>;
export type UpdatePreparedProductForm = z.infer<
	typeof updatePreparedProductSchema
>;
export type ProduceStockForm = z.infer<typeof produceStockSchema>;
