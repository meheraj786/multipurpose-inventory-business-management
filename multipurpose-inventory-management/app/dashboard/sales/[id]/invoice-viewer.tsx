"use client";

import { Printer, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGetMyAccount } from "@/hooks/useAccount";
import { useCurrency } from "@/hooks/useCurrency";
import type { Sale, SaleInvoice } from "@/hooks/useSale";
import { calculateSaleFinancials } from "@/lib/api/services/sale.service";
import type { AccountDetail } from "@/validation/account.schema";
import type { PaymentMethod } from "@/validation/sale.schema";
import { PAYMENT_METHOD_LABELS } from "@/validation/sale.schema";

type InvoiceFormat = "a4" | "thermal";

type Props = { invoice: SaleInvoice; sale: Sale; onClose: () => void };

interface PaymentItem {
	method: string;
	amount: number;
	transactionId?: string;
}

export function InvoiceViewer({ invoice, sale, onClose }: Props) {
	const [format, setFormat] = useState<InvoiceFormat>("a4");
	const printRef = useRef<HTMLDivElement>(null);
	const { symbol } = useCurrency();
	const { data: account } = useGetMyAccount();

	const financials = calculateSaleFinancials(sale);
	const subtotal = financials.baseGrandTotal + Number(sale.discount ?? 0);
	const globalDiscount = Number(sale.discount ?? 0);
	const grandTotal = financials.adjustedGrandTotal;

	const handlePrint = () => {
		const content = printRef.current;
		if (!content) return;

		const printWindow = window.open("", "_blank", "width=1200,height=800");
		if (!printWindow) return;

		printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${account?.saleIdPrefix || ""}${invoice.id.slice(0, 8).toUpperCase()}</title>
          <style>
            ${format === "a4" ? a4Styles : thermalStyles}
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);

		printWindow.document.close();
		printWindow.focus();
		setTimeout(() => {
			printWindow.print();
		}, 500);
	};

	const sharedProps = {
		invoice,
		sale,
		subtotal,
		grandTotal,
		symbol,
		globalDiscount,
		account,
	};

	return (
		<div className="flex flex-col gap-4 h-full">
			<div className="flex items-center justify-between px-6 pt-4 border-b pb-4 bg-background">
				<div className="flex gap-2">
					<Button
						variant={format === "a4" ? "default" : "outline"}
						size="sm"
						onClick={() => setFormat("a4")}
						className="h-8 text-xs font-semibold"
					>
						Standard A4 Format
					</Button>
					<Button
						variant={format === "thermal" ? "default" : "outline"}
						size="sm"
						onClick={() => setFormat("thermal")}
						className="h-8 text-xs font-semibold"
					>
						Thermal Receipt (POS)
					</Button>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handlePrint}
						className="h-8 text-xs"
					>
						<Printer className="h-3.5 w-3.5 mr-1.5" /> Print Invoice
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="h-8 w-8 rounded-full"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-6 bg-muted/20 flex justify-center items-start min-h-[400px]">
				<div
					ref={printRef}
					className={
						format === "a4"
							? "bg-white shadow-md w-[794px] min-h-[1123px] p-12 border border-border rounded"
							: "bg-white shadow-md w-[310px] p-5 font-mono text-[11px] border border-border rounded"
					}
				>
					{format === "a4" ? (
						<A4Invoice {...sharedProps} />
					) : (
						<ThermalInvoice {...sharedProps} />
					)}
				</div>
			</div>
		</div>
	);
}

type InvoiceProps = {
	invoice: SaleInvoice;
	sale: Sale;
	subtotal: number;
	grandTotal: number;
	symbol: string;
	globalDiscount: number;
	account?: AccountDetail | null;
};

function A4Invoice({
	invoice,
	sale,
	subtotal,
	grandTotal,
	symbol,
	globalDiscount,
	account,
}: InvoiceProps) {
	const STATUS_LABEL: Record<string, string> = {
		PENDING: "Pending",
		PAID: "Paid",
		PARTIALLY_PAID: "Partially Paid",
		CANCELLED: "Cancelled",
	};
	const statusLabel = STATUS_LABEL[invoice.status] ?? invoice.status;
	const prefix = account?.saleIdPrefix || "";

	return (
		<div
			style={{
				fontFamily: "Inter, sans-serif",
				color: "#1e293b",
				fontSize: "13px",
				lineHeight: "1.5",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					marginBottom: "35px",
				}}
			>
				<div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
					{account?.logo && (
						<div
							style={{ position: "relative", height: "60px", width: "120px" }}
						>
							<Image
								src={account.logo}
								alt="Logo"
								fill
								sizes="120px"
								style={{
									objectFit: "contain",
								}}
							/>
						</div>
					)}
					<div>
						<h1
							style={{
								fontSize: "20px",
								fontWeight: "800",
								color: "#0f172a",
								margin: 0,
								letterSpacing: "-0.02em",
							}}
						>
							{account?.companyName || "INVOICE RECEIPT"}
						</h1>
						<p
							style={{
								color: "#64748b",
								margin: "4px 0 0",
								fontSize: "12px",
								fontFamily: "monospace",
							}}
						>
							Ref: #{prefix}
							{invoice.id.slice(0, 8).toUpperCase()}
						</p>
					</div>
				</div>
				<div style={{ textAlign: "right" }}>
					<span
						style={{
							display: "inline-block",
							padding: "6px 14px",
							borderRadius: "6px",
							fontSize: "11px",
							fontWeight: "700",
							textTransform: "uppercase",
							letterSpacing: "0.05em",
							background:
								invoice.status === "PAID"
									? "#dcfce7"
									: invoice.status === "PARTIALLY_PAID"
										? "#dbeafe"
										: invoice.status === "CANCELLED"
											? "#fee2e2"
											: "#fef9c3",
							color:
								invoice.status === "PAID"
									? "#15803d"
									: invoice.status === "PARTIALLY_PAID"
										? "#1d4ed8"
										: invoice.status === "CANCELLED"
											? "#b91c1c"
											: "#a16207",
						}}
					>
						{statusLabel}
					</span>
				</div>
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1.2fr 1fr",
					gap: "20px",
					marginBottom: "35px",
				}}
			>
				<div>
					<p
						style={{
							fontWeight: "700",
							color: "#475569",
							margin: "0 0 6px 0",
							fontSize: "11px",
							textTransform: "uppercase",
						}}
					>
						Bill To
					</p>
					<p
						style={{
							fontSize: "14px",
							fontWeight: "600",
							color: "#0f172a",
							margin: "0 0 4px 0",
						}}
					>
						{invoice.billTo}
					</p>
					{sale.customer && (
						<div style={{ color: "#64748b", fontSize: "12px" }}>
							<p style={{ margin: "2px 0" }}>Phone: {sale.customer.phone}</p>
							{sale.customer.email && (
								<p style={{ margin: "2px 0" }}>Email: {sale.customer.email}</p>
							)}
							{sale.customer.address && (
								<p style={{ margin: "2px 0" }}>
									Address: {sale.customer.address}
								</p>
							)}
						</div>
					)}
				</div>
				<div style={{ textAlign: "right" }}>
					<p
						style={{
							fontWeight: "700",
							color: "#475569",
							margin: "0 0 6px 0",
							fontSize: "11px",
							textTransform: "uppercase",
						}}
					>
						Invoice Records
					</p>
					<p style={{ margin: "0 0 4px 0", fontSize: "12px" }}>
						<span style={{ color: "#64748b" }}>Invoice Date: </span>
						<strong style={{ color: "#334155" }}>
							{new Date(invoice.invoiceDate).toLocaleDateString()}
						</strong>
					</p>
					<p style={{ margin: "0 0 4px 0", fontSize: "12px" }}>
						<span style={{ color: "#64748b" }}>Sale Date: </span>
						<strong style={{ color: "#334155" }}>
							{new Date(sale.createdAt).toLocaleDateString()}
						</strong>
					</p>
					<p style={{ margin: "0", fontSize: "12px" }}>
						<span style={{ color: "#64748b" }}>Standard Method: </span>
						<strong style={{ color: "#334155", textTransform: "uppercase" }}>
							{sale.paymentMethod.replace(/_/g, " ")}
						</strong>
					</p>
				</div>
			</div>

			<table
				style={{
					width: "100%",
					borderCollapse: "collapse",
					marginBottom: "25px",
				}}
			>
				<thead>
					<tr
						style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}
					>
						{[
							"#",
							"Description",
							"Type",
							"Qty",
							"Price",
							"Discount",
							"Total",
						].map((col, idx) => (
							<th
								key={col}
								style={{
									padding: "10px 12px",
									textAlign: idx === 1 ? "left" : idx === 2 ? "left" : "right",
									fontSize: "11px",
									fontWeight: "700",
									color: "#475569",
									textTransform: "uppercase",
								}}
							>
								{col}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{sale.saleItems.map((item, i) => {
						const lineTotal =
							Number(item.sellPrice) * item.quantity -
							Number(item.discount ?? 0);
						const isPrepared = item.itemType === "PREPARED_PRODUCT";

						return (
							<tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
								<td
									style={{
										padding: "12px",
										color: "#94a3b8",
										fontSize: "11px",
									}}
								>
									{i + 1}
								</td>
								<td
									style={{
										padding: "12px",
										fontWeight: "600",
										color: "#334155",
									}}
								>
									{item.product?.name ??
										item.preparedProduct?.name ??
										"Product"}
								</td>
								<td style={{ padding: "12px" }}>
									<span
										style={{
											fontSize: "9px",
											fontWeight: "700",
											padding: "2px 6px",
											borderRadius: "4px",
											background: isPrepared ? "#fff7ed" : "#f1f5f9",
											color: isPrepared ? "#ea580c" : "#475569",
											border: isPrepared
												? "1px solid #ffedd5"
												: "1px solid #e2e8f0",
										}}
									>
										{isPrepared ? "PREPARED" : "PRODUCT"}
									</span>
								</td>
								<td
									style={{
										padding: "12px",
										textAlign: "right",
										fontWeight: "600",
									}}
								>
									{item.quantity}
								</td>
								<td style={{ padding: "12px", textAlign: "right" }}>
									{symbol}
									{Number(item.sellPrice).toFixed(2)}
								</td>
								<td
									style={{
										padding: "12px",
										textAlign: "right",
										color: "#dc2626",
									}}
								>
									{Number(item.discount) > 0
										? `-${symbol}${Number(item.discount).toFixed(2)}`
										: "—"}
								</td>
								<td
									style={{
										padding: "12px",
										textAlign: "right",
										fontWeight: "700",
										color: "#0f172a",
									}}
								>
									{symbol}
									{lineTotal.toFixed(2)}
								</td>
							</tr>
						);
					})}
					{sale.saleServices.map((sv, idx) => (
						<tr key={sv.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
							<td
								style={{ padding: "12px", color: "#94a3b8", fontSize: "11px" }}
							>
								{sale.saleItems.length + idx + 1}
							</td>
							<td
								style={{ padding: "12px", fontWeight: "600", color: "#334155" }}
							>
								{sv.service?.name ?? "Service Item"}
							</td>
							<td style={{ padding: "12px" }}>
								<span
									style={{
										fontSize: "9px",
										fontWeight: "700",
										padding: "2px 6px",
										borderRadius: "4px",
										background: "#f0fdfa",
										color: "#0d9488",
										border: "1px solid #ccfbf1",
									}}
								>
									SERVICE
								</span>
							</td>
							<td
								style={{
									padding: "12px",
									textAlign: "right",
									fontWeight: "600",
								}}
							>
								{sv.quantity}
							</td>
							<td style={{ padding: "12px", textAlign: "right" }}>
								{symbol}
								{Number(sv.unitPrice).toFixed(2)}
							</td>
							<td
								style={{
									padding: "12px",
									textAlign: "right",
									color: "#dc2626",
								}}
							>
								{Number(sv.discount) > 0
									? `-${symbol}${Number(sv.discount).toFixed(2)}`
									: "—"}
							</td>
							<td
								style={{
									padding: "12px",
									textAlign: "right",
									fontWeight: "700",
									color: "#0f172a",
								}}
							>
								{symbol}
								{Number(sv.total).toFixed(2)}
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1.2fr 1fr",
					gap: "30px",
					marginTop: "20px",
				}}
			>
				<div>
					{sale.payments && (
						<div
							style={{
								padding: "16px",
								background: "#f8fafc",
								borderRadius: "8px",
								border: "1px solid #e2e8f0",
							}}
						>
							<p
								style={{
									fontWeight: "700",
									fontSize: "11px",
									textTransform: "uppercase",
									color: "#475569",
									margin: "0 0 10px 0",
									borderBottom: "1px solid #e2e8f0",
									paddingBottom: "6px",
								}}
							>
								Transactional Payment Ledger
							</p>
							<div
								style={{ display: "flex", flexDirection: "column", gap: "8px" }}
							>
								{getParsedPayments(sale.payments).map((payment) => (
									<div
										key={payment.amount}
										style={{
											display: "flex",
											justifyContent: "space-between",
											fontSize: "12px",
										}}
									>
										<div>
											<strong
												style={{ color: "#334155", textTransform: "uppercase" }}
											>
												{payment.method.replace(/_/g, " ")}
											</strong>
											{payment.transactionId && (
												<span
													style={{
														display: "block",
														color: "#94a3b8",
														fontSize: "10px",
														fontFamily: "monospace",
													}}
												>
													TX: {payment.transactionId}
												</span>
											)}
										</div>
										<span style={{ fontWeight: "700" }}>
											{symbol}
											{Number(payment.amount).toFixed(2)}
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				<div style={{ fontSize: "13px" }}>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							padding: "6px 0",
							color: "#64748b",
						}}
					>
						<span>Subtotal Amount</span>
						<span style={{ fontWeight: "600", color: "#334155" }}>
							{symbol}
							{subtotal.toFixed(2)}
						</span>
					</div>

					{globalDiscount > 0 && (
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								padding: "6px 0",
								color: "#dc2626",
							}}
						>
							<span>Adjustment Discount</span>
							<span style={{ fontWeight: "600" }}>
								-{symbol}
								{globalDiscount.toFixed(2)}
							</span>
						</div>
					)}

					{Number(sale.due) > 0 && (
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								padding: "6px 0",
								color: "#ea580c",
							}}
						>
							<span>Balance Due Outstanding</span>
							<span style={{ fontWeight: "600" }}>
								{symbol}
								{Number(sale.due).toFixed(2)}
							</span>
						</div>
					)}

					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							padding: "12px 0",
							borderTop: "2px solid #e2e8f0",
							margin: "8px 0 0",
							fontWeight: "800",
							fontSize: "16px",
							color: "#0f172a",
						}}
					>
						<span>Grand Total</span>
						<span>
							{symbol}
							{grandTotal.toFixed(2)}
						</span>
					</div>

					{account?.digitalSignature && (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "flex-end",
								marginTop: "25px",
							}}
						>
							<p
								style={{
									fontSize: "10px",
									color: "#94a3b8",
									marginBottom: "5px",
								}}
							>
								AUTHORIZED SIGNATURE
							</p>
							<div
								style={{ position: "relative", height: "45px", width: "110px" }}
							>
								<Image
									src={account.digitalSignature}
									alt="Signature"
									fill
									sizes="110px"
									style={{
										objectFit: "contain",
									}}
								/>
							</div>
						</div>
					)}
				</div>
			</div>

			<div
				style={{
					marginTop: "60px",
					borderTop: "1px solid #e2e8f0",
					paddingTop: "20px",
					textAlign: "center",
					color: "#94a3b8",
					fontSize: "11px",
				}}
			>
				<p style={{ margin: "0 0 4px 0", fontWeight: "600" }}>
					{account?.footerNotes || "Thank you for your business."}
				</p>
				<p style={{ margin: "0", fontFamily: "monospace", fontSize: "10px" }}>
					Document Reference: {sale.id}
				</p>
			</div>
		</div>
	);
}

function ThermalInvoice({
	invoice,
	sale,
	subtotal,
	grandTotal,
	symbol,
	globalDiscount,
	account,
}: InvoiceProps) {
	const dashes = "--------------------------------";
	const method = sale.paymentMethod as PaymentMethod;
	const STATUS_LABEL: Record<string, string> = {
		PENDING: "Pending",
		PAID: "Paid",
		PARTIALLY_PAID: "Partially Paid",
		CANCELLED: "Cancelled",
	};
	const statusLabel = STATUS_LABEL[invoice.status] ?? invoice.status;
	const prefix = account?.saleIdPrefix || "";

	return (
		<div
			style={{
				fontFamily: "monospace",
				fontSize: "11px",
				lineHeight: "1.4",
				color: "#000",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					marginBottom: "10px",
				}}
			>
				{account?.logo && (
					<div
						style={{
							position: "relative",
							height: "35px",
							width: "80px",
							marginBottom: "6px",
						}}
					>
						<Image
							src={account.logo}
							alt="Logo"
							fill
							sizes="80px"
							style={{
								objectFit: "contain",
							}}
						/>
					</div>
				)}
				<h2
					style={{
						fontSize: "14px",
						fontWeight: "bold",
						margin: "0 0 2px 0",
						textAlign: "center",
					}}
				>
					{account?.companyName?.toUpperCase() || "RECEIPT"}
				</h2>
				<p style={{ margin: "0 0 2px 0" }}>
					#{prefix}
					{invoice.id.slice(0, 10).toUpperCase()}
				</p>
				<p style={{ margin: "0" }}>
					{new Date(invoice.invoiceDate).toLocaleString()}
				</p>
			</div>

			<p style={{ margin: "4px 0", textAlign: "center" }}>{dashes}</p>

			<div style={{ margin: "6px 0" }}>
				<p style={{ margin: "2px 0" }}>BILL TO: {invoice.billTo}</p>
				{sale.customer?.phone && (
					<p style={{ margin: "2px 0" }}>PHONE: {sale.customer.phone}</p>
				)}
				<p style={{ margin: "2px 0", textTransform: "uppercase" }}>
					PAYMENT: {PAYMENT_METHOD_LABELS[method] ?? method}
				</p>
				<p style={{ margin: "2px 0" }}>STATUS: {statusLabel}</p>
			</div>

			{sale.payments && (
				<>
					<p style={{ margin: "4px 0", textAlign: "center" }}>{dashes}</p>
					<div style={{ margin: "4px 0" }}>
						{getParsedPayments(sale.payments).map((p) => (
							<div key={p.amount} style={{ marginBottom: "2px" }}>
								<div
									style={{ display: "flex", justifyContent: "space-between" }}
								>
									<span style={{ textTransform: "uppercase" }}>
										{p.method.slice(0, 16)}
									</span>
									<span style={{ fontWeight: "bold" }}>
										{symbol}
										{Number(p.amount).toFixed(2)}
									</span>
								</div>
								{p.transactionId && (
									<p style={{ margin: "1px 0 0 4px", fontSize: "9px" }}>
										TXN: {p.transactionId}
									</p>
								)}
							</div>
						))}
					</div>
				</>
			)}

			<p style={{ margin: "4px 0", textAlign: "center" }}>{dashes}</p>

			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					fontWeight: "bold",
					marginBottom: "4px",
				}}
			>
				<span style={{ flex: 3 }}>Item</span>
				<span style={{ flex: 1, textAlign: "center" }}>Qty</span>
				<span style={{ flex: 1.5, textAlign: "right" }}>Total</span>
			</div>

			<p style={{ margin: "2px 0", textAlign: "center" }}>{dashes}</p>

			{sale.saleItems.map((item) => {
				const lineTotal =
					Number(item.sellPrice) * item.quantity - Number(item.discount ?? 0);
				return (
					<div key={item.id} style={{ marginBottom: "4px" }}>
						<div style={{ display: "flex", justifyContent: "space-between" }}>
							<span style={{ flex: 3 }}>
								{(
									item.product?.name ??
									item.preparedProduct?.name ??
									"Product"
								).slice(0, 14)}
							</span>
							<span style={{ flex: 1, textAlign: "center" }}>
								{item.quantity}
							</span>
							<span style={{ flex: 1.5, textAlign: "right" }}>
								{lineTotal.toFixed(2)}
							</span>
						</div>
						{Number(item.discount) > 0 && (
							<div style={{ fontSize: "10px", paddingLeft: "4px" }}>
								DISC: -{Number(item.discount).toFixed(2)}
							</div>
						)}
					</div>
				);
			})}

			{sale.saleServices.map((sv) => (
				<div key={sv.id} style={{ marginBottom: "4px" }}>
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<span style={{ flex: 3 }}>
							{(sv.service?.name ?? "Service").slice(0, 14)}
						</span>
						<span style={{ flex: 1, textAlign: "center" }}>{sv.quantity}</span>
						<span style={{ flex: 1.5, textAlign: "right" }}>
							{Number(sv.total).toFixed(2)}
						</span>
					</div>
					{Number(sv.discount) > 0 && (
						<div style={{ fontSize: "10px", paddingLeft: "4px" }}>
							DISC: -{Number(sv.discount).toFixed(2)}
						</div>
					)}
				</div>
			))}

			<p style={{ margin: "4px 0", textAlign: "center" }}>{dashes}</p>

			<div style={{ margin: "4px 0" }}>
				<div style={{ display: "flex", justifyContent: "space-between" }}>
					<span>Subtotal</span>
					<span>
						{symbol}
						{subtotal.toFixed(2)}
					</span>
				</div>
				{globalDiscount > 0 && (
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<span>Discount</span>
						<span>
							-{symbol}
							{globalDiscount.toFixed(2)}
						</span>
					</div>
				)}
				{Number(sale.due) > 0 && (
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<span>Due</span>
						<span>
							{symbol}
							{Number(sale.due).toFixed(2)}
						</span>
					</div>
				)}
			</div>

			<p style={{ margin: "4px 0", textAlign: "center" }}>{dashes}</p>

			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					fontWeight: "bold",
					fontSize: "12px",
					margin: "4px 0",
				}}
			>
				<span>TOTAL</span>
				<span>
					{symbol}
					{grandTotal.toFixed(2)}
				</span>
			</div>

			<p style={{ margin: "4px 0", textAlign: "center" }}>{dashes}</p>

			<div style={{ textAlign: "center", marginTop: "10px" }}>
				<p style={{ margin: "0 0 4px 0" }}>
					{account?.footerNotes || "Thank you for visiting!"}
				</p>
				<p style={{ margin: "0", fontSize: "9px" }}>
					Ref: {sale.id.slice(0, 18)}
				</p>
			</div>
		</div>
	);
}

function getParsedPayments(payments: string | PaymentItem[]): PaymentItem[] {
	if (!payments) return [];
	try {
		if (typeof payments === "string") {
			return JSON.parse(payments);
		}
		if (Array.isArray(payments)) {
			return payments as PaymentItem[];
		}
	} catch (_e) {
		return [];
	}
	return [];
}

const a4Styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: 'Inter', sans-serif; 
    font-size: 13px; 
    color: #1e293b; 
    background: white; 
    padding: 15mm;
  }
  @page { 
    size: A4; 
    margin: 0; 
  }
  @media print { 
    body { 
      -webkit-print-color-adjust: exact; 
      print-color-adjust: exact; 
    } 
  }
`;

const thermalStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: monospace; 
    font-size: 11px; 
    line-height: 1.4; 
    color: #000; 
    background: white; 
    width: 80mm; 
    padding: 4mm;
  }
  @page { 
    size: 80mm auto; 
    margin: 0; 
  }
  @media print { 
    body { 
      -webkit-print-color-adjust: exact; 
      print-color-adjust: exact; 
    } 
  }
`;
