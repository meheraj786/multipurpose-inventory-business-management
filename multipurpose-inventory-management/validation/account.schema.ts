import { z } from "zod";

export const createAccountSchema = z.object({
	companyName: z.string().min(2, "Company name must be at least 2 characters"),
	category: z.string().min(2, "Category is required"),
	type: z.string().min(2, "Type is required"),
	model: z.enum([
		"RETAIL",
		"SERVICE",
		"RESTAURANT",
		"RETAIL_AND_SERVICE",
		"SERVICE_AND_RESTAURANT",
		"RETAIL_AND_RESTAURANT",
		"RETAIL_AND_SERVICE_AND_RESTAURANT",
	]),
	logo: z.string().optional(),
	pricingPlanId: z.string().optional(),
	saleIdPrefix: z.string().optional(),
	footerNotes: z.string().optional(),
	digitalSignature: z.string().optional(),
	subsDate: z.string().optional(),
	subsExpiryDate: z.string().optional(),
	currency: z.enum(["USD", "BDT", "EUR", "GBP"]),
	status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
});

export const updateAccountSchema = createAccountSchema.partial();

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

export interface PricingPlan {
	id: string;
	name: string;
	description?: string | null;
	monthlyPrice: number;
	yearlyPrice: number;
}

export interface AccountDetail {
	id: string;
	companyName: string;
	category: string;
	type: string;
	model:
		| "RETAIL"
		| "SERVICE"
		| "RESTAURANT"
		| "RETAIL_AND_SERVICE"
		| "SERVICE_AND_RESTAURANT"
		| "RETAIL_AND_RESTAURANT"
		| "RETAIL_AND_SERVICE_AND_RESTAURANT";
	logo?: string | null;
	pricingPlanId?: string | null;
	pricingPlan?: PricingPlan | null;
	saleIdPrefix?: string | null;
	footerNotes?: string | null;
	digitalSignature?: string | null;
	subsDate?: string | null;
	subsExpiryDate?: string | null;
	currency: "USD" | "BDT" | "EUR" | "GBP";
	status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
	createdAt: string;
	updatedAt: string;
}

export interface PaginatedAccountResponse {
	data: AccountDetail[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}
