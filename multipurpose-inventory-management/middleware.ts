import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ─── Route → required model features ─────────────────────────────────────────

const RETAIL_ROUTES = [
	"/dashboard/products",
	"/dashboard/inventory",
	"/dashboard/suppliers",
	"/dashboard/purchases",
];

const SERVICE_ROUTES = ["/dashboard/services"];

const RESTAURANT_ROUTES = [
	"/dashboard/raw-products",
	"/dashboard/prepared-products",
];

// Admin-only routes (role check, not model check)
const ADMIN_ROUTES = [
	"/dashboard/staff",
	"/dashboard/activityLog",
	"/dashboard/trash",
	// "/dashboard/reports",
	"/dashboard/settings",
];

// ─── Route → required module for STAFF permission check ──────────────────────
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

// ─── Model → which feature sets are allowed ───────────────────────────────────

const MODEL_PERMISSIONS: Record<
	string,
	{ retail: boolean; service: boolean; restaurant: boolean }
> = {
	RETAIL: { retail: true, service: false, restaurant: false },
	SERVICE: { retail: false, service: true, restaurant: false },
	RESTAURANT: { retail: false, service: false, restaurant: true },
	RETAIL_AND_SERVICE: { retail: true, service: true, restaurant: false },
	SERVICE_AND_RESTAURANT: { retail: false, service: true, restaurant: true },
	RETAIL_AND_RESTAURANT: { retail: true, service: false, restaurant: true },
	RETAIL_AND_SERVICE_AND_RESTAURANT: {
		retail: true,
		service: true,
		restaurant: true,
	},
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function isRouteMatch(pathname: string, routes: string[]): boolean {
	return routes.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);
}

function getStoredAuth(request: NextRequest): {
	role: string | null;
	model: string | null;
	permissions: string[];
} {
	// Read from the Zustand persisted localStorage key via cookie is not possible
	// in middleware — instead we store model+role as a lightweight cookie on login.
	// See step 2 below for how to set these cookies.
	const role = request.cookies.get("userRole")?.value ?? null;
	const model = request.cookies.get("userModel")?.value ?? null;
	const permissionsStr = request.cookies.get("userPermissions")?.value ?? "";
	const permissions = permissionsStr ? permissionsStr.split(",") : [];
	return { role, model, permissions };
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const isDashboardRoute = pathname.startsWith("/dashboard");
	const isAuthRoute =
		pathname.startsWith("/login") || pathname.startsWith("/signup");

	const accessToken = request.cookies.get("accessToken")?.value;
	const refreshToken = request.cookies.get("refreshToken")?.value;
	const isAuthenticated = !!(accessToken || refreshToken);

	// ── 1. Auth guard ──────────────────────────────────────────────────────────
	if (isDashboardRoute && !isAuthenticated) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(loginUrl);
	}

	if (isAuthRoute && isAuthenticated) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// ── 2. Model + role guard (only for authenticated dashboard routes) ─────────
	if (isDashboardRoute && isAuthenticated) {
		const { role, model, permissions } = getStoredAuth(request);

		// If cookies aren't set yet (first load), let through — the client
		// will redirect via useModelGuard hook (see step 3)
		if (!role || !model) {
			return NextResponse.next();
		}

		const isAdmin = role === "ADMIN" || role === "DEVELOPER";
		const isStaff = role === "STAFF";
		const perms = MODEL_PERMISSIONS[model] ?? {
			retail: false,
			service: false,
			restaurant: false,
		};

		// Admin-only routes
		if (isRouteMatch(pathname, ADMIN_ROUTES) && !isAdmin) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}

		// ─── STAFF-specific module permission check ────────────────────────────
		if (isStaff) {
			// Find the required module for this route
			const requiredModule = Object.entries(ROUTE_MODULE_MAP).find(([route]) =>
				isRouteMatch(pathname, [route]),
			)?.[1];

			// If this is a protected route and staff doesn't have permission, block it
			if (requiredModule && !permissions.includes(requiredModule)) {
				return NextResponse.redirect(new URL("/dashboard", request.url));
			}
		}

		// Model-gated routes (for non-STAFF users)
		if (!isStaff) {
			if (isRouteMatch(pathname, RETAIL_ROUTES) && !perms.retail) {
				return NextResponse.redirect(new URL("/dashboard", request.url));
			}

			if (isRouteMatch(pathname, SERVICE_ROUTES) && !perms.service) {
				return NextResponse.redirect(new URL("/dashboard", request.url));
			}

			if (isRouteMatch(pathname, RESTAURANT_ROUTES) && !perms.restaurant) {
				return NextResponse.redirect(new URL("/dashboard", request.url));
			}
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/login", "/signup"],
};
