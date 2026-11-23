import * as z from "zod";

export const createStaffSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	name: z.string().min(2, "Name is required").max(100),
	customRoleId: z.string().min(1).nullable().optional(),
});

export type CreateStaffForm = z.infer<typeof createStaffSchema>;
export const updateStaffSchema = createStaffSchema
	.omit({ password: true })
	.extend({
		password: z.string().min(6).optional(),
	})
	.partial();
export type UpdateStaffForm = z.infer<typeof updateStaffSchema>;
