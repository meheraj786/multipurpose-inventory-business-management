import type { LucideIcon } from "lucide-react";
import {
	Activity,
	Box,
	// ClipboardList,
	Home,
	Package,
	Settings,
	// ShoppingBag,
	ShoppingCart,
	Stars,
	Tag,
	Trash2,
	TrendingUp,
	Truck,
	Users,
	Utensils,
	Wrench,
} from "lucide-react";

export type NavItem = {
	label: string;
	href: string;
	icon: LucideIcon;
	module: string;
};

export type NavGroup = {
	title: string;
	items: NavItem[];
};

// ─── Always visible (no model/permission gate) ───────────────────────────────
export const CORE_NAV: NavItem[] = [
	{ label: "Dashboard", href: "/dashboard", icon: Home, module: "DASHBOARD" },
];

// ─── RETAIL model routes ──────────────────────────────────────────────────────
export const RETAIL_NAV: NavItem[] = [
	{
		label: "Products",
		href: "/dashboard/products",
		icon: Box,
		module: "PRODUCT",
	},
	{
		label: "Inventory",
		href: "/dashboard/inventory",
		icon: Package,
		module: "STOCK",
	},
	{
		label: "Suppliers",
		href: "/dashboard/suppliers",
		icon: Truck,
		module: "SUPPLIER",
	},
	{
		label: "Purchases",
		href: "/dashboard/purchases",
		icon: ShoppingCart,
		module: "PURCHASE",
	},
	{
		label: "Wastage",
		href: "/dashboard/wastage",
		icon: Trash2,
		module: "STOCK",
	},
];

// ─── SERVICE model routes ─────────────────────────────────────────────────────
export const SERVICE_NAV: NavItem[] = [
	{
		label: "Services",
		href: "/dashboard/services",
		icon: Wrench,
		module: "SERVICE",
	},
];

// ─── RESTAURANT model routes ──────────────────────────────────────────────────
export const RESTAURANT_NAV: NavItem[] = [
	{
		label: "Raw Products",
		href: "/dashboard/raw-products",
		icon: Utensils,
		module: "RAW_PRODUCT",
	},
	{
		label: "Prepared Products",
		href: "/dashboard/prepared-products",
		icon: Utensils,
		module: "PREPARED_PRODUCT",
	},
	{
		label: "Wastage",
		href: "/dashboard/wastage",
		icon: Trash2,
		module: "STOCK",
	},
];

// ─── Shared business routes (all models) ─────────────────────────────────────
export const SHARED_BUSINESS_NAV: NavItem[] = [
	{
		label: "Customers",
		href: "/dashboard/customers",
		icon: Users,
		module: "CUSTOMER",
	},
	{
		label: "Sales",
		href: "/dashboard/sales",
		icon: TrendingUp,
		module: "SALE",
	},
	// {
	// 	label: "Invoices",
	// 	href: "/dashboard/invoices",
	// 	icon: ClipboardList,
	// 	module: "INVOICE",
	// },
];

// ─── Taxonomy (always if model supports it) ───────────────────────────────────
export const TAXONOMY_NAV: NavItem[] = [
	{
		label: "Categories",
		href: "/dashboard/categories",
		icon: Tag,
		module: "CATEGORY",
	},
	{
		label: "Subcategories",
		href: "/dashboard/subCategories",
		icon: Tag,
		module: "SUBCATEGORY",
	},
];

// ─── Admin-only routes ────────────────────────────────────────────────────────
export const ADMIN_NAV: NavItem[] = [
	{
		label: "My Assistant",
		href: "/dashboard/assistant",
		icon: Stars,
		module: "ASSISTANT",
	},
	// { label: "Staff", href: "/dashboard/staff", icon: Users, module: "STAFF" },
	{
		label: "Activity Log",
		href: "/dashboard/activityLog",
		icon: Activity,
		module: "ACTIVITY_LOG",
	},
	{ label: "Trash", href: "/dashboard/trash", icon: Trash2, module: "TRASH" },
	// {
	// 	label: "Reports",
	// 	href: "/dashboard/reports",
	// 	icon: BarChart3,
	// 	module: "ACCOUNT",
	// },
	{
		label: "Settings",
		href: "/dashboard/settings",
		icon: Settings,
		module: "ACCOUNT",
	},
];
