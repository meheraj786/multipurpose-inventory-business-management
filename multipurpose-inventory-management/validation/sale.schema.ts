import * as z from "zod";

export const PAYMENT_METHODS = [
	"CASH",
	"CARD",
	"MOBILE_BANKING",
	"CREDIT",
	"CASH_AND_CARD",
	"CASH_AND_MOBILE_BANKING",
	"CASH_AND_CREDIT",
	"CARD_AND_MOBILE_BANKING",
	"CARD_AND_CREDIT",
	"MOBILE_BANKING_AND_CREDIT",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const HYBRID_METHODS: PaymentMethod[] = [
	"CASH_AND_CARD",
	"CASH_AND_MOBILE_BANKING",
	"CASH_AND_CREDIT",
	"CARD_AND_MOBILE_BANKING",
	"CARD_AND_CREDIT",
	"MOBILE_BANKING_AND_CREDIT",
];

export const HYBRID_PARTS: Record<string, [PaymentMethod, PaymentMethod]> = {
	CASH_AND_CARD: ["CASH", "CARD"],
	CASH_AND_MOBILE_BANKING: ["CASH", "MOBILE_BANKING"],
	CASH_AND_CREDIT: ["CASH", "CREDIT"],
	CARD_AND_MOBILE_BANKING: ["CARD", "MOBILE_BANKING"],
	CARD_AND_CREDIT: ["CARD", "CREDIT"],
	MOBILE_BANKING_AND_CREDIT: ["MOBILE_BANKING", "CREDIT"],
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
	CASH: "Cash",
	CARD: "Card",
	MOBILE_BANKING: "Mobile Banking",
	CREDIT: "Credit",
	CASH_AND_CARD: "Cash + Card",
	CASH_AND_MOBILE_BANKING: "Cash + Mobile Banking",
	CASH_AND_CREDIT: "Cash + Credit",
	CARD_AND_MOBILE_BANKING: "Card + Mobile Banking",
	CARD_AND_CREDIT: "Card + Credit",
	MOBILE_BANKING_AND_CREDIT: "Mobile Banking + Credit",
};

export const isHybrid = (method: PaymentMethod | string): boolean =>
	HYBRID_METHODS.includes(method as PaymentMethod);

export type AccountModel =
	| "RETAIL"
	| "SERVICE"
	| "RESTAURANT"
	| "RETAIL_AND_SERVICE"
	| "SERVICE_AND_RESTAURANT"
	| "RETAIL_AND_RESTAURANT"
	| "RETAIL_AND_SERVICE_AND_RESTAURANT";

// NOTE: previously these were hardcoded lists, and `modelHasItems` incorrectly
// included plain "RESTAURANT" — meaning a restaurant-only account would see
// the regular retail Product picker instead of Prepared Products. Substring
// checks handle all 7 model combinations correctly and need no maintenance
// if new combos are added.
export const modelHasItems = (model: AccountModel | string): boolean =>
	model.includes("RETAIL");

export const modelHasServices = (model: AccountModel | string): boolean =>
	model.includes("SERVICE");

export const modelHasPreparedProducts = (
	model: AccountModel | string,
): boolean => model.includes("RESTAURANT");

export const SALE_ITEM_TYPES = ["PRODUCT", "PREPARED_PRODUCT"] as const;
export type SaleItemType = (typeof SALE_ITEM_TYPES)[number];

export const paymentEntrySchema = z.object({
	method: z.enum(PAYMENT_METHODS),
	amount: z.coerce.number().min(0, "Amount must be non-negative"),
	transactionId: z.string().optional(),
});

export const saleItemSchema = z
	.object({
		itemType: z.enum(SALE_ITEM_TYPES),
		productId: z.string().optional(),
		preparedProductId: z.string().optional(),
		unitId: z.string().min(1, "Unit is required"),
		quantity: z.coerce.number().min(0.0001, "Quantity must be greater than 0"),
		sellPrice: z.coerce.number().min(0, "Price cannot be negative"),
		discount: z.coerce.number().min(0).optional(),
	})
	.refine(
		(data) =>
			data.itemType === "PREPARED_PRODUCT"
				? !!data.preparedProductId?.trim()
				: !!data.productId?.trim(),
		{
			message: "Select a product or menu item",
			path: ["productId"],
		},
	);

export const saleServiceItemSchema = z.object({
	serviceId: z.string().min(1, "Service is required"),
	quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
	unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
	discount: z.coerce.number().min(0).optional(),
});

const isFilledSaleItem = (i: {
	itemType?: SaleItemType;
	productId?: string;
	preparedProductId?: string;
}) =>
	i.itemType === "PREPARED_PRODUCT"
		? !!i.preparedProductId && i.preparedProductId.trim() !== ""
		: !!i.productId && i.productId.trim() !== "";

export const createSaleSchema = z
	.object({
		customerId: z.string().optional(),
		customerNumber: z.string().optional(),
		paymentMethod: z.enum(PAYMENT_METHODS),
		payments: z.array(paymentEntrySchema).optional(),
		discount: z.coerce.number().min(0).optional(),
		due: z.coerce.number().min(0).optional(),
		// Accept the raw arrays as-is — we'll filter and validate below
		saleItems: z.array(saleItemSchema).optional(),
		saleServices: z.array(saleServiceItemSchema).optional(),
	})
	.superRefine((data, ctx) => {
		// Filter out empty/blank rows before checking
		const filledItems = (data.saleItems ?? []).filter(isFilledSaleItem);
		const filledServices = (data.saleServices ?? []).filter(
			(s) => s.serviceId && s.serviceId.trim() !== "",
		);

		// Must have at least one of either
		if (filledItems.length === 0 && filledServices.length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "At least one product, menu item, or service is required",
				path: ["saleItems"],
			});
		}
	});

export const updateSaleSchema = z.object({
	customerId: z.string().optional(),
	customerNumber: z.string().optional(),
	paymentMethod: z.enum(PAYMENT_METHODS).optional(),
	payments: z.array(paymentEntrySchema).optional(),
	discount: z.coerce.number().min(0).optional(),
	due: z.coerce.number().min(0).optional(),
	saleItems: z.array(saleItemSchema).optional(),
	saleServices: z.array(saleServiceItemSchema).optional(),
});

export type CreateSaleForm = z.infer<typeof createSaleSchema>;
export type UpdateSaleForm = z.infer<typeof updateSaleSchema>;
export type SaleItemForm = z.infer<typeof saleItemSchema>;
export type SaleServiceItemForm = z.infer<typeof saleServiceItemSchema>;
export type PaymentEntryForm = z.infer<typeof paymentEntrySchema>;
