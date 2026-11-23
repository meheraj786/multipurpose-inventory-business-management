import * as z from "zod";

export const SYSTEM_MODULES = [
	"AUTH",
	"USER",
	"ACCOUNT",
	"CATEGORY",
	"SUBCATEGORY",
	"SUPPLIER",
	"PRODUCT",
	"RAW_PRODUCT",
	"PREPARED_PRODUCT",
	"PURCHASE",
	"SERVICE",
	"CUSTOMER",
	"SALE",
	"WASTAGE",
	"INVOICE",
	"PERMISSION",
	"PRICING_PLAN",
	"NOTIFICATION",
	"ACTIVITY_LOG",
	"TRASH",
	"STOCK",
	"STAFF",
] as const;

export const SYSTEM_ACTIONS = [
	"CREATE",
	"READ",
	"UPDATE",
	"DELETE",
	"RESTORE",
	"LOGIN",
	"LOGOUT",
	"STOCK_IN",
	"STOCK_OUT",
] as const;

export type SystemModule = (typeof SYSTEM_MODULES)[number];
export type SystemAction = (typeof SYSTEM_ACTIONS)[number];

export const createStaffSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	name: z.string().min(2, "Name is required").max(100),
});

export const updatePermissionsSchema = z.object({
	permissions: z.array(
		z.object({
			module: z.enum(SYSTEM_MODULES),
			actions: z.array(z.enum(SYSTEM_ACTIONS)),
		}),
	),
});

export type CreateStaffForm = z.infer<typeof createStaffSchema>;
export const updateStaffSchema = createStaffSchema.partial();
export type UpdateStaffForm = z.infer<typeof updateStaffSchema>;
export type PermissionEntry = z.infer<
	typeof updatePermissionsSchema
>["permissions"][0];
