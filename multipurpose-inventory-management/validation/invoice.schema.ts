import * as z from "zod";

export const INVOICE_STATUSES = [
	"PENDING",
	"PAID",
	"PARTIALLY_PAID",
	"CANCELLED",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const createInvoiceSchema = z.object({
	billTo: z.string().min(2, "Bill to must be at least 2 characters"),
	invoiceDate: z.string(),
	saleId: z.string().min(1, "Sale is required"),
	status: z.enum(INVOICE_STATUSES),
	grandTotal: z.coerce.number().positive("Grand total must be positive"),
});

export const updateInvoiceSchema = z.object({
	billTo: z.string().min(2).optional(),
	invoiceDate: z.string().optional(),
	status: z.enum(INVOICE_STATUSES).optional(),
	grandTotal: z.coerce.number().positive().optional(),
});

export type CreateInvoiceForm = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceForm = z.infer<typeof updateInvoiceSchema>;
