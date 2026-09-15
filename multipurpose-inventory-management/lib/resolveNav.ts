import type { AuthUser } from "@/validation/auth.schema";
import {
	ADMIN_NAV,
	CORE_NAV,
	type NavGroup,
	type NavItem,
	RESTAURANT_NAV,
	RETAIL_NAV,
	SERVICE_NAV,
	SHARED_BUSINESS_NAV,
	TAXONOMY_NAV,
} from "./navigation";

type AccountModel =
	| "RETAIL"
	| "SERVICE"
	| "RESTAURANT"
	| "RETAIL_AND_SERVICE"
	| "SERVICE_AND_RESTAURANT"
	| "RETAIL_AND_RESTAURANT"
	| "RETAIL_AND_SERVICE_AND_RESTAURANT";

const MODEL_MAP: Record<AccountModel, NavItem[]> = {
	RETAIL: [...RETAIL_NAV],
	SERVICE: [...SERVICE_NAV],
	RESTAURANT: [...RESTAURANT_NAV],
	RETAIL_AND_SERVICE: [...RETAIL_NAV, ...SERVICE_NAV],
	SERVICE_AND_RESTAURANT: [...SERVICE_NAV, ...RESTAURANT_NAV],
	RETAIL_AND_RESTAURANT: [...RETAIL_NAV, ...RESTAURANT_NAV],
	RETAIL_AND_SERVICE_AND_RESTAURANT: [
		...RETAIL_NAV,
		...SERVICE_NAV,
		...RESTAURANT_NAV,
	],
};

export function resolveNavGroups(user: AuthUser | null): NavGroup[] {
	if (!user) return [];

	const model = user.account?.model as AccountModel | undefined;
	const isAdmin = user.role === "ADMIN" || user.role === "DEVELOPER";

	// 1. Model-specific items
	const modelItems: NavItem[] = model ? (MODEL_MAP[model] ?? []) : [];

	// 2. Permission-filter for non-admins
	const permittedModules = new Set(
		(user.permissions ?? []).map((p) => p.module),
	);

	const filterByPermission = (items: NavItem[]): NavItem[] => {
		if (isAdmin) return items;
		return items.filter((item) => permittedModules.has(item.module));
	};

	// 3. Build groups
	const groups: NavGroup[] = [
		{
			title: "",
			items: CORE_NAV,
		},
		{
			title: "Business",
			items: filterByPermission([...modelItems, ...SHARED_BUSINESS_NAV]),
		},
		{
			title: "Catalogue",
			items: filterByPermission(TAXONOMY_NAV),
		},
	];

	// 4. Admin group — only shown to ADMIN/DEVELOPER
	if (isAdmin) {
		groups.push({
			title: "Administration",
			items: ADMIN_NAV,
		});
	}

	// Remove empty groups
	return groups.filter((g) => g.items.length > 0);
}
