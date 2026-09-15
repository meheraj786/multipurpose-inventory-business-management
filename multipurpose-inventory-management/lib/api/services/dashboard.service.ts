import api from "../client";

// ---------- Query params ----------
export type DashboardQueryParams = {
	range?: string;
	startDate?: string;
	endDate?: string;
	limit?: number;
};
export type Granularity = "day" | "week" | "month";
// Sales overview
export type DashboardSalesOverview = {
	range: string;
	startDate: string | null;
	endDate: string | null;
	totalSales: number;
	totalAmount: number;
	profitMargin: number;
	totalProfit: number;
	granularity: Granularity;
	chart: {
		date: string;
		sales: number;
		amount: number;
		profit: number;
		label: string;
		salesCount: number;
	}[];
};

// Overview stats
export type DashboardOverviewStats = {
	range: string;
	startDate: string | null;
	endDate: string | null;
	totalRevenue: number;
	activeCustomers: number;
	totalCustomers: number;
	growthRate: number | null;
};

// Top customers
export type DashboardTopCustomer = {
	customerId: string | null;
	name: string;
	phone: string | null;
	salesCount: number;
	totalPurchase: number;
	totalDue: number;
};

// Due ranking
export type DashboardDueRanking = {
	customerId: string | null;
	name: string;
	phone: string | null;
	salesWithDue: number;
	totalDue: number;
};

// Category ranking
export type DashboardCategoryRanking = {
	categories: {
		categoryId: string;
		name: string;
		quantity: number;
		revenue: number;
	}[];
	subCategories: {
		subCategoryId: string;
		name: string;
		quantity: number;
		revenue: number;
	}[];
};

// Low stock alert
export type DashboardLowStockAlert = {
	products: {
		id: string;
		name: string;
		sku: string | null;
		unit: string | null;
		category: string | null;
		currentStock: number;
		threshold: number | null;
	}[];
	rawProducts: {
		id: string;
		name: string;
		unit: string | null;
		category: string | null;
		currentStock: number;
		threshold: number | null;
	}[];
};

// Product ranking
export type DashboardProductRanking = {
	products: {
		productId: string;
		name: string;
		sku: string | null;
		quantity: number;
		revenue: number;
	}[];
	preparedProducts: {
		preparedProductId: string;
		name: string;
		quantity: number;
		revenue: number;
	}[];
	services: {
		serviceId: string;
		name: string;
		quantity: number;
		revenue: number;
	}[];
};

// Top suppliers
export type DashboardTopSupplier = {
	supplierId: string;
	name: string;
	companyName: string | null;
	purchaseCount: number;
	totalQuantity: number;
	totalPurchase: number;
};

// Purchase overview
export type DashboardPurchaseOverview = {
	range: string;
	startDate: string | null;
	endDate: string | null;
	totalPurchases: number;
	totalQuantity: number;
	totalCost: number;
	chart: { date: string; purchases: number; quantity: number; cost: number }[];
};

// Purchase report
export type DashboardPurchaseReport = {
	summary: {
		totalPurchases: number;
		totalQuantity: number;
		totalCost: number;
	};
	purchases: {
		id: string;
		supplierId: string | null;
		supplier: string | null;
		companyName: string | null;
		quantity: number;
		purchasePrice: number;
		rate: number;
		totalCost: number;
		notes: string | null;
		createdAt: string;
	}[];
};

// ---------- API functions ----------

const getSalesOverview = async (
	params: DashboardQueryParams,
): Promise<DashboardSalesOverview> => {
	const { data } = await api.get("/dashboard/sales-overview", { params });
	return data.data;
};

const getOverviewStats = async (
	params: DashboardQueryParams,
): Promise<DashboardOverviewStats> => {
	const { data } = await api.get("/dashboard/stats", { params });
	return data.data;
};

const getTopCustomers = async (
	params: DashboardQueryParams,
): Promise<DashboardTopCustomer[]> => {
	const { data } = await api.get("/dashboard/top-customers", { params });
	return data.data;
};

const getDueRanking = async (
	params: DashboardQueryParams,
): Promise<DashboardDueRanking[]> => {
	const { data } = await api.get("/dashboard/due-ranking", { params });
	return data.data;
};

const getCategoryRanking = async (
	params: DashboardQueryParams,
): Promise<DashboardCategoryRanking> => {
	const { data } = await api.get("/dashboard/category-ranking", { params });
	return data.data;
};

const getProductRanking = async (
	params: DashboardQueryParams,
): Promise<DashboardProductRanking> => {
	const { data } = await api.get("/dashboard/product-ranking", { params });
	return data.data;
};

const getLowStockAlert = async (): Promise<DashboardLowStockAlert> => {
	const { data } = await api.get("/dashboard/low-stock-alert");
	return data.data;
};

const getTopSuppliers = async (
	params: DashboardQueryParams,
): Promise<DashboardTopSupplier[]> => {
	const { data } = await api.get("/dashboard/top-suppliers", { params });
	return data.data;
};

const getPurchaseOverview = async (
	params: DashboardQueryParams,
): Promise<DashboardPurchaseOverview> => {
	const { data } = await api.get("/dashboard/purchase-overview", { params });
	return data.data;
};

const getPurchaseReport = async (
	params: DashboardQueryParams,
): Promise<DashboardPurchaseReport> => {
	const { data } = await api.get("/dashboard/purchase-report", { params });
	return data.data;
};

export const DashboardApiService = {
	getSalesOverview,
	getOverviewStats,
	getTopCustomers,
	getDueRanking,
	getCategoryRanking,
	getProductRanking,
	getLowStockAlert,
	getTopSuppliers,
	getPurchaseOverview,
	getPurchaseReport,
};
