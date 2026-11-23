import * as z from "zod";

export const serviceResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	internalCost: z.number().nullable().optional(),
	salePrice: z.number(),
	description: z.string().nullable().optional(),
	categoryId: z.string(),
	subCategoryId: z.string().nullable().optional(),
	isDeleted: z.boolean(),
	createdAt: z.union([z.string(), z.date()]).transform((val) => new Date(val)),
	updatedAt: z.string().optional(),
	category: z.object({ id: z.string(), name: z.string() }).optional(),
	subCategory: z
		.object({ id: z.string(), name: z.string() })
		.nullable()
		.optional(),
});

const serviceBaseSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name cannot exceed 100 characters"),
	internalCost: z.coerce.number().min(0, "Internal cost cannot be negative"),
	salePrice: z.coerce.number().min(0, "Sale price cannot be negative"),
	description: z.string(),
	categoryId: z.string().min(1, "Category is required"),
	subCategoryId: z.string(),
});

export const createServiceSchema = serviceBaseSchema;
export const updateServiceSchema = serviceBaseSchema;

export type ServiceData = z.infer<typeof serviceResponseSchema>;
export type CreateServiceForm = z.infer<typeof createServiceSchema>;
export type UpdateServiceForm = z.infer<typeof updateServiceSchema>;
