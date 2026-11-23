import * as z from "zod";

export const categoryResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable().optional(),
	features: z.array(z.string()).optional(),
	isDeleted: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string().optional(),
	subCategories: z
		.array(z.object({ id: z.string(), name: z.string() }))
		.optional(),
});

export const createCategorySchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name cannot exceed 100 characters"),
	description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CategoryData = z.infer<typeof categoryResponseSchema>;
export type CreateCategoryForm = z.infer<typeof createCategorySchema>;
export type UpdateCategoryForm = z.infer<typeof updateCategorySchema>;
