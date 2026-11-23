import { useQuery } from "@tanstack/react-query";
import {
	DashboardApiService,
	type DashboardQueryParams,
} from "@/lib/api/services/dashboard.service";

const DASHBOARD_KEYS = {
	salesOverview: "dashboard-sales-overview",
	stats: "dashboard-stats",
	topCustomers: "dashboard-top-customers",
	dueRanking: "dashboard-due-ranking",
	categoryRanking: "dashboard-category-ranking",
	productRanking: "dashboard-product-ranking",
	lowStockAlert: "dashboard-low-stock-alert",
	topSuppliers: "dashboard-top-suppliers",
	purchaseOverview: "dashboard-purchase-overview",
	purchaseReport: "dashboard-purchase-report",
};

export const useDashboardSalesOverview = (params: DashboardQueryParams) =>
	useQuery({
		queryKey: [DASHBOARD_KEYS.salesOverview, params],
		queryFn: () => DashboardApiService.getSalesOverview(params),
		placeholderData: (prev) => prev,
	});

export const useDashboardOverviewStats = (params: DashboardQueryParams) =>
	useQuery({
		queryKey: [DASHBOARD_KEYS.stats, params],
		queryFn: () => DashboardApiService.getOverviewStats(params),
		placeholderData: (prev) => prev,
	});

export const useDashboardTopCustomers = (params: DashboardQueryParams) =>
	useQuery({
		queryKey: [DASHBOARD_KEYS.topCustomers, params],
		queryFn: () => DashboardApiService.getTopCustomers(params),
		placeholderData: (prev) => prev,
	});

export const useDashboardDueRanking = (params: DashboardQueryParams) =>
	useQuery({
		queryKey: [DASHBOARD_KEYS.dueRanking, params],
		queryFn: () => DashboardApiService.getDueRanking(params),
		placeholderData: (prev) => prev,
	});

export const useDashboardCategoryRanking = (params: DashboardQueryParams) =>
	useQuery({
		queryKey: [DASHBOARD_KEYS.categoryRanking, params],
		queryFn: () => DashboardApiService.getCategoryRanking(params),
		placeholderData: (prev) => prev,
	});

export const useDashboardProductRanking = (params: DashboardQueryParams) =>
	useQuery({
		queryKey: [DASHBOARD_KEYS.productRanking, params],
		queryFn: () => DashboardApiService.getProductRanking(params),
		placeholderData: (prev) => prev,
	});

export const useDashboardLowStockAlert = () =>
	useQuery({
		queryKey: [DASHBOARD_KEYS.lowStockAlert],
		queryFn: () => DashboardApiService.getLowStockAlert(),
	});

export const useDashboardTopSuppliers = (params: DashboardQueryParams) =>
	useQuery({
		queryKey: [DASHBOARD_KEYS.topSuppliers, params],
		queryFn: () => DashboardApiService.getTopSuppliers(params),
		placeholderData: (prev) => prev,
	});

export const useDashboardPurchaseOverview = (params: DashboardQueryParams) =>
	useQuery({
		queryKey: [DASHBOARD_KEYS.purchaseOverview, params],
		queryFn: () => DashboardApiService.getPurchaseOverview(params),
		placeholderData: (prev) => prev,
	});

export const useDashboardPurchaseReport = (params: DashboardQueryParams) =>
	useQuery({
		queryKey: [DASHBOARD_KEYS.purchaseReport, params],
		queryFn: () => DashboardApiService.getPurchaseReport(params),
		placeholderData: (prev) => prev,
	});
