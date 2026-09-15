import * as z from "zod";

export const customerResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string().nullable().optional(),
	phone: z.string(),
	address: z.string().nullable().optional(),
	hasMembership: z.boolean(),
	accountId: z.string(),
	isDeleted: z.boolean(),
	createdAt: z.union([z.string(), z.date()]).transform((val) => new Date(val)),
	updatedAt: z.string().optional(),
});

export const createCustomerSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters").max(100),
	phone: z.string().min(7, "Phone must be at least 7 characters").max(20),
	email: z
		.union([z.string().email("Invalid email address"), z.literal("")])
		.optional(),
	address: z.union([z.string(), z.literal("")]).optional(),
	hasMembership: z.boolean(),
});

export const updateCustomerSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(100)
		.optional(),
	phone: z
		.string()
		.min(7, "Phone must be at least 7 characters")
		.max(20)
		.optional(),
	email: z
		.union([z.string().email("Invalid email address"), z.literal("")])
		.optional(),
	address: z.union([z.string(), z.literal("")]).optional(),
	hasMembership: z.boolean().optional(),
});

export type CustomerData = z.infer<typeof customerResponseSchema>;
export type CreateCustomerForm = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerForm = z.infer<typeof updateCustomerSchema>;
