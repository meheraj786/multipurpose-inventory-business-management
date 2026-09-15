import * as z from "zod";

export const purchaseItemSchema = z.object({
	productId: z.string().min(1, "Product is required"),
	unitId: z.string().optional(),
	quantity: z.coerce.number().min(0.0001, "Quantity must be greater than 0"),
	purchasePrice: z.coerce.number().min(0, "Price cannot be negative"),
	rate: z.coerce.number().optional(),
	batch: z.string().optional(),
	notes: z.string().optional(),
});

export const paymentOptionEnum = z.enum(["DUE", "PARTIAL", "FULL"]);

export const paymentMethodEnum = z.enum([
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
]);

export const createPurchaseSchema = z
	.object({
		supplierId: z.string().optional(),
		items: z.array(purchaseItemSchema).min(1, "At least one item is required"),
		notes: z.string().optional(),
		paymentOption: paymentOptionEnum,
		paymentAmount: z.coerce.number().optional(),
		paymentMethod: paymentMethodEnum.optional(),
		paymentNote: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.paymentOption === "PARTIAL") {
			if (!data.paymentAmount || data.paymentAmount <= 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["paymentAmount"],
					message: "Enter a payment amount greater than 0",
				});
			}
			const total = data.items.reduce(
				(sum, item) => sum + item.quantity * item.purchasePrice,
				0,
			);
			if (data.paymentAmount && data.paymentAmount > total) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["paymentAmount"],
					message: "Payment cannot exceed the total cost",
				});
			}
		}
		if (
			(data.paymentOption === "PARTIAL" || data.paymentOption === "FULL") &&
			!data.paymentMethod
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["paymentMethod"],
				message: "Select a payment method",
			});
		}
	});

export const updatePurchaseSchema = z.object({
	supplierId: z.string().optional(),
	qty: z.coerce.number().min(0.0001, "Quantity must be greater than 0"),
	purchasePrice: z.coerce.number().min(0, "Price cannot be negative"),
	rate: z.coerce.number().optional(),
	notes: z.string().optional(),
});

export const recordPurchasePaymentSchema = z.object({
	amount: z.coerce.number().positive("Amount must be greater than 0"),
	method: paymentMethodEnum,
	note: z.string().optional(),
	paidAt: z.string().optional(),
});

export type CreatePurchaseForm = z.infer<typeof createPurchaseSchema>;
export type CreatePurchaseInput = z.input<typeof createPurchaseSchema>;
export type UpdatePurchaseForm = z.infer<typeof updatePurchaseSchema>;
export type RecordPurchasePaymentForm = z.infer<
	typeof recordPurchasePaymentSchema
>;
