import * as z from "zod";

export const subCategoryResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable().optional(),
	categoryId: z.string(),
	isDeleted: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string().optional(),
	category: z.object({ id: z.string(), name: z.string() }).optional(),
});

export const createSubCategorySchema = z.object({
	categoryId: z.string().min(1, "Parent category is required"),
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name cannot exceed 100 characters"),
	description: z.string().optional(),
});

export const updateSubCategorySchema = createSubCategorySchema.partial();

export type SubCategoryData = z.infer<typeof subCategoryResponseSchema>;
export type CreateSubCategoryForm = z.infer<typeof createSubCategorySchema>;
export type UpdateSubCategoryForm = z.infer<typeof updateSubCategorySchema>;
