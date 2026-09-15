import { z } from "zod";

export const registerSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	companyName: z.string().min(2, "Company name is required"),
	category: z.string().min(1),
	type: z.string().min(1),
	model: z.enum([
		"RETAIL",
		"SERVICE",
		"RESTAURANT",
		"RETAIL_AND_SERVICE",
		"SERVICE_AND_RESTAURANT",
		"RETAIL_AND_RESTAURANT",
		"RETAIL_AND_SERVICE_AND_RESTAURANT",
	]),
	currency: z.enum(["USD", "BDT", "EUR", "GBP"]).default("BDT"),
	pricingPlanId: z.string().optional(),
});

export const loginSchema = z.object({
	email: z.string().email("Invalid email"),
	password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthUser {
	id: string;
	email: string;
	role: string;
	accountId: string;
	account: {
		id: string;
		companyName: string;
		model: string;
		status: string;
		currency: "USD" | "BDT" | "EUR" | "GBP";
	};
	permissions: {
		module: string;
		actions: string[];
	}[];
}

export interface ApiResponse<T = unknown> {
	success: boolean;
	message: string;
	data?: T;
}
