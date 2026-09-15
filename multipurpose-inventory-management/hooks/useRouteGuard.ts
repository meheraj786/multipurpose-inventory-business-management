import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useBusinessModel } from "@/lib/business-model";
import { useAuthStore } from "@/lib/store/useAuthStore";

// Route to module mapping for permission checking
const ROUTE_MODULE_MAP: Record<string, string> = {
	"/dashboard/products": "PRODUCT",
	"/dashboard/inventory": "STOCK",
	"/dashboard/suppliers": "SUPPLIER",
	"/dashboard/purchases": "PURCHASE",
	"/dashboard/services": "SERVICE",
	"/dashboard/raw-products": "RAW_PRODUCT",
	"/dashboard/prepared-products": "PREPARED_PRODUCT",
	"/dashboard/customers": "CUSTOMER",
	"/dashboard/sales": "SALE",
	"/dashboard/categories": "CATEGORY",
	"/dashboard/subCategories": "SUBCATEGORY",
};

// Admin-only routes
const ADMIN_ROUTES = [
	"/dashboard/staff",
	"/dashboard/activityLog",
	"/dashboard/trash",
	"/dashboard/settings",
];

/**
 * Client-side route guard hook that prevents unauthorized access to protected routes.
 * This complements the server-side middleware protection.
 *
 * - ADMIN users can access all routes except those specifically gated to other roles
 * - STAFF users can only access routes where they have module permission
 * - DEVELOPER users bypass all checks
 */
export function useRouteGuard() {
	const pathname = usePathname();
	const router = useRouter();
	const user = useAuthStore((s) => s.user);
	const _businessModel = useBusinessModel();

	useEffect(() => {
		if (!user || !pathname.startsWith("/dashboard")) {
			return;
		}

		const isAdmin = user.role === "ADMIN" || user.role === "DEVELOPER";
		const isStaff = user.role === "STAFF";

		// ADMIN and DEVELOPER can access most routes (except those blocked elsewhere)
		if (isAdmin) {
			return;
		}

		// ─── STAFF-specific checks ─────────────────────────────────────────────────
		if (isStaff) {
			// Check if this route requires a specific module permission
			const requiredModule = ROUTE_MODULE_MAP[pathname];

			if (requiredModule) {
				// Check if staff has permission for this module
				const hasPermission = user.permissions?.some(
					(p) => p.module === requiredModule,
				);

				if (!hasPermission) {
					// Redirect to dashboard if no permission
					router.push("/dashboard");
					return;
				}
			}
		}

		// ─── ADMIN-only route checks ──────────────────────────────────────────────
		if (
			ADMIN_ROUTES.some(
				(route) => pathname === route || pathname.startsWith(`${route}/`),
			)
		) {
			if (!isAdmin) {
				router.push("/dashboard");
				return;
			}
		}
	}, [pathname, user, router]);
}
