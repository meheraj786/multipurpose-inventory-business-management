import { describe, expect, it } from "vitest";
import { calculateSaleFinancials, type Sale } from "./sale.service";

describe("calculateSaleFinancials", () => {
	it("subtracts returned item values and profit from the sale totals", () => {
		const sale = {
			id: "sale-1",
			customerId: null,
			customerNumber: null,
			paymentMethod: "CASH",
			payments: null,
			discount: 10,
			due: 50,
			isDeleted: false,
			createdAt: "2024-01-01T00:00:00.000Z",
			updatedAt: "2024-01-01T00:00:00.000Z",
			saleItems: [
				{
					id: "item-1",
					saleId: "sale-1",
					itemType: "PRODUCT",
					productId: "product-1",
					preparedProductId: null,
					unitId: "unit-1",
					quantity: 2,
					purchasePrice: 20,
					sellPrice: 30,
					discount: 4,
					createdAt: "2024-01-01T00:00:00.000Z",
					product: null,
					preparedProduct: null,
				},
			],
			saleServices: [
				{
					id: "svc-1",
					saleId: "sale-1",
					serviceId: "service-1",
					quantity: 1,
					unitPrice: 10,
					discount: 0,
					total: 10,
					service: {
						id: "service-1",
						name: "Setup",
						internalCost: 4,
					},
				},
			],
			customerReturns: [
				{
					id: "return-1",
					saleId: "sale-1",
					itemType: "PRODUCT",
					productId: "product-1",
					preparedProductId: null,
					quantity: 1,
					refundAmount: 30,
					excessRefundAmount: 0,
					requiresManualRefund: false,
					restocked: true,
					reason: null,
					createdAt: "2024-01-01T00:00:00.000Z",
					updatedAt: "2024-01-01T00:00:00.000Z",
					product: null,
					preparedProduct: null,
				},
			],
			customer: null,
			invoices: [],
		} as Sale;

		const result = calculateSaleFinancials(sale);

		expect(result.adjustedGrandTotal).toBe(26);
		expect(result.adjustedProfit).toBe(14);
		expect(result.totalPaid).toBe(0);
	});
});
