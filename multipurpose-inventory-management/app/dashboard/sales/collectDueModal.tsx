"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCurrency } from "@/hooks/useCurrency";
import type { Sale } from "@/hooks/useSale";
import { usePayDue } from "@/hooks/useSale";
import {
	PAYMENT_METHOD_LABELS,
	PAYMENT_METHODS,
} from "@/validation/sale.schema";

type Props = {
	sale: Sale;
	onClose: () => void;
};

type FormValues = {
	amountPaid: number;
	paymentMethod: string;
	transactionId: string;
	notes: string;
};

export function CollectDueModal({ sale, onClose }: Props) {
	const { symbol } = useCurrency();
	const { mutate: payDue, isPending } = usePayDue();

	const currentDue = Number(sale.due ?? 0);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		defaultValues: {
			amountPaid: currentDue,
			paymentMethod: "CASH",
			transactionId: "",
			notes: "",
		},
	});

	const watchedAmount = watch("amountPaid") ?? 0;
	const watchedMethod = watch("paymentMethod");
	const remainingAfter = Math.max(0, currentDue - Number(watchedAmount));
	const willClear = remainingAfter === 0;
	const needsTransactionId = ["CARD", "MOBILE_BANKING", "CREDIT"].includes(
		watchedMethod,
	);

	const onSubmit = (values: FormValues) => {
		if (Number(values.amountPaid) <= 0) return;
		if (Number(values.amountPaid) > currentDue) return;

		payDue(
			{
				id: sale.id,
				payload: {
					amountPaid: Number(values.amountPaid),
					paymentMethod: values.paymentMethod,
					transactionId: values.transactionId || undefined,
					notes: values.notes || undefined,
				},
			},
			{ onSuccess: onClose },
		);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
			{/* Sale info */}
			<div className="rounded-md border p-4 bg-muted/30 space-y-2">
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">Sale ID</span>
					<span className="font-mono text-xs">
						#{sale.id.slice(0, 8).toUpperCase()}
					</span>
				</div>
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">Customer</span>
					<span className="font-medium">
						{sale.customer?.name ?? sale.customerNumber ?? "Walk-in"}
					</span>
				</div>
				<div className="flex justify-between text-sm border-t pt-2">
					<span className="text-muted-foreground font-medium">
						Outstanding Due
					</span>
					<span className="text-destructive font-bold text-base">
						{symbol}
						{currentDue.toFixed(2)}
					</span>
				</div>
			</div>

			{/* Payment method */}
			<Field>
				<FieldLabel>Payment Method</FieldLabel>
				<select
					className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					{...register("paymentMethod", { required: true })}
				>
					{PAYMENT_METHODS.filter(
						(m) =>
							![
								"CASH_AND_CARD",
								"CASH_AND_MOBILE_BANKING",
								"CASH_AND_CREDIT",
								"CARD_AND_MOBILE_BANKING",
								"CARD_AND_CREDIT",
								"MOBILE_BANKING_AND_CREDIT",
							].includes(m),
					).map((m) => (
						<option key={m} value={m}>
							{PAYMENT_METHOD_LABELS[m]}
						</option>
					))}
				</select>
			</Field>

			{/* Transaction ID — shown for non-cash methods */}
			{needsTransactionId && (
				<Field>
					<FieldLabel>Transaction ID (optional)</FieldLabel>
					<Input placeholder="e.g. TXN123456" {...register("transactionId")} />
				</Field>
			)}

			{/* Amount paid */}
			<Field>
				<FieldLabel>Amount to Collect</FieldLabel>
				<Input
					type="number"
					step="0.01"
					min={0.01}
					max={currentDue}
					{...register("amountPaid", {
						required: "Amount is required",
						min: { value: 0.01, message: "Amount must be greater than 0" },
						max: {
							value: currentDue,
							message: `Cannot exceed due amount (${symbol}${currentDue.toFixed(2)})`,
						},
					})}
				/>
				{errors.amountPaid && (
					<FieldError>{errors.amountPaid.message}</FieldError>
				)}
			</Field>

			{/* Notes */}
			<Field>
				<FieldLabel>Notes (optional)</FieldLabel>
				<Input
					placeholder="e.g. Partial payment agreed"
					{...register("notes")}
				/>
			</Field>

			{/* Live preview */}
			<div className="rounded-md border p-4 space-y-2 bg-muted/30">
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">Collecting</span>
					<span className="font-semibold tabular-nums">
						{symbol}
						{Number(watchedAmount || 0).toFixed(2)}
					</span>
				</div>
				<div className="flex justify-between text-sm border-t pt-2">
					<span className="text-muted-foreground">Remaining Due After</span>
					<span
						className={
							willClear
								? "text-green-600 font-bold"
								: "text-orange-600 font-semibold"
						}
					>
						{willClear ? "Cleared ✓" : `${symbol}${remainingAfter.toFixed(2)}`}
					</span>
				</div>
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">Invoice Status</span>
					<span
						className={
							willClear
								? "text-green-600 font-medium"
								: "text-blue-600 font-medium"
						}
					>
						{willClear ? "PAID" : "PARTIALLY PAID"}
					</span>
				</div>
			</div>

			<div className="flex justify-end gap-3 pt-2 border-t">
				<Button
					type="button"
					variant="ghost"
					onClick={onClose}
					disabled={isPending}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={isPending || Number(watchedAmount) <= 0}
				>
					{isPending ? "Processing..." : "Collect Payment"}
				</Button>
			</div>
		</form>
	);
}
