import * as z from "zod";

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
export type SystemAction = (typeof SYSTEM_ACTIONS)[number];

export const ROLE_MODULES = [
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
	"TRASH",
	"ACTIVITY_LOG",
] as const;
export type RoleModule = (typeof ROLE_MODULES)[number];

const rolePermissionSchema = z
	.object({
		module: z.enum(ROLE_MODULES),
		actions: z.array(z.enum(SYSTEM_ACTIONS)).max(SYSTEM_ACTIONS.length),
	})
	.superRefine(({ module, actions }, context) => {
		const allowedActions = new Set([
			...(module === "ACTIVITY_LOG"
				? ["READ"]
				: module === "TRASH"
					? ["READ", "DELETE", "RESTORE"]
					: ["CREATE", "READ", "UPDATE", "DELETE"]),
			...(module === "PURCHASE" ? ["RESTORE"] : []),
			...(module === "PRODUCT" ||
			module === "RAW_PRODUCT" ||
			module === "PREPARED_PRODUCT"
				? ["STOCK_IN"]
				: []),
			...(module === "PRODUCT" ||
			module === "RAW_PRODUCT" ||
			module === "PREPARED_PRODUCT" ||
			module === "WASTAGE"
				? ["STOCK_OUT"]
				: []),
		]);
		actions.forEach((action, index) => {
			if (!allowedActions.has(action)) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["actions", index],
					message: `${action} is not valid for ${module}`,
				});
			}
		});
		if (new Set(actions).size !== actions.length) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["actions"],
				message: "Duplicate actions are not allowed",
			});
		}
	});

export const rolePermissionsSchema = z
	.array(rolePermissionSchema)
	.refine(
		(permissions) =>
			new Set(permissions.map(({ module }) => module)).size ===
			permissions.length,
		"Each module can only be listed once",
	);

export const createRoleSchema = z.object({
	name: z.string().trim().min(2).max(80),
	description: z.string().trim().max(250).optional(),
	permissions: rolePermissionsSchema,
});

export type RoleForm = z.infer<typeof createRoleSchema>;
export type RolePermissionEntry = z.infer<typeof rolePermissionSchema>;
