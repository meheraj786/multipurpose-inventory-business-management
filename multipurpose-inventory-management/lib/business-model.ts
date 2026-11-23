import { useAuthStore } from "@/lib/store/useAuthStore";
import type { AuthUser } from "@/validation/auth.schema";

export type AccountModel =
	| "RETAIL"
	| "SERVICE"
	| "RESTAURANT"
	| "RETAIL_AND_SERVICE"
	| "SERVICE_AND_RESTAURANT"
	| "RETAIL_AND_RESTAURANT"
	| "RETAIL_AND_SERVICE_AND_RESTAURANT";

export type SystemModule =
	| "AUTH"
	| "USER"
	| "ACCOUNT"
	| "CATEGORY"
	| "SUBCATEGORY"
	| "SUPPLIER"
	| "PRODUCT"
	| "RAW_PRODUCT"
	| "PREPARED_PRODUCT"
	| "PURCHASE"
	| "SERVICE"
	| "CUSTOMER"
	| "SALE"
	| "WASTAGE"
	| "INVOICE"
	| "PERMISSION"
	| "PRICING_PLAN"
	| "NOTIFICATION"
	| "ACTIVITY_LOG"
	| "TRASH"
	| "STOCK"
	| "STAFF";

const RETAIL_MODULES: SystemModule[] = [
	"PRODUCT",
	"SUPPLIER",
	"PURCHASE",
	"STOCK",
];
const SERVICE_MODULES: SystemModule[] = ["SERVICE"];
const RESTAURANT_MODULES: SystemModule[] = ["RAW_PRODUCT", "PREPARED_PRODUCT"];

const MODEL_MODULE_MAP: Record<AccountModel, SystemModule[]> = {
	RETAIL: RETAIL_MODULES,
	SERVICE: SERVICE_MODULES,
	RESTAURANT: RESTAURANT_MODULES,
	RETAIL_AND_SERVICE: [...RETAIL_MODULES, ...SERVICE_MODULES],
	SERVICE_AND_RESTAURANT: [...SERVICE_MODULES, ...RESTAURANT_MODULES],
	RETAIL_AND_RESTAURANT: [...RETAIL_MODULES, ...RESTAURANT_MODULES],
	RETAIL_AND_SERVICE_AND_RESTAURANT: [
		...RETAIL_MODULES,
		...SERVICE_MODULES,
		...RESTAURANT_MODULES,
	],
};

export const MODEL_GATED_MODULES: SystemModule[] = [
	"SUPPLIER",
	"PRODUCT",
	"RAW_PRODUCT",
	"PREPARED_PRODUCT",
	"PURCHASE",
	"SERVICE",
];

export const getAllowedModulesForModel = (
	model: AccountModel | undefined,
): Set<SystemModule> => {
	if (!model) return new Set();
	return new Set(MODEL_MODULE_MAP[model] ?? []);
};

export const isModuleAllowedForModel = (
	moduleName: string,
	model: AccountModel | undefined,
): boolean => {
	if (!MODEL_GATED_MODULES.includes(moduleName as SystemModule)) return true;
	return getAllowedModulesForModel(model).has(moduleName as SystemModule);
};

export const useBusinessModel = (): AccountModel | undefined =>
	useAuthStore(
		(state: { user: AuthUser | null }) =>
			state.user?.account?.model as AccountModel | undefined,
	);
