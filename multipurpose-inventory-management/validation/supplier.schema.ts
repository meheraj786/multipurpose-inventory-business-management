import * as z from "zod";

export const createSupplierSchema = z.object({
	name: z.string().min(1, "Name is required"),
	contact: z.string().min(1, "Contact is required"),
	email: z.string().email().optional().or(z.literal("")),
	companyName: z.string().optional().or(z.literal("")),
	address: z.string().optional().or(z.literal("")),
});

export type CreateSupplierForm = z.infer<typeof createSupplierSchema>;
