"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCurrency } from "@/hooks/useCurrency";
import { useRecordPurchasePayment } from "@/hooks/usePurchases";
import type { Purchase } from "@/lib/api/services/purchase.service";
import {
	type RecordPurchasePaymentForm,
	recordPurchasePaymentSchema,
} from "@/validation/purchase.schema";

type Props = {
	purchase: Purchase;
	onClose: () => void;
};

const PAYMENT_METHODS: {
	value: RecordPurchasePaymentForm["method"];
	label: string;
}[] = [
	{ value: "CASH", label: "Cash" },
	{ value: "CARD", label: "Card" },
	{ value: "MOBILE_BANKING", label: "Mobile Banking" },
	{ value: "CREDIT", label: "Credit" },
	{ value: "CASH_AND_CARD", label: "Cash + Card" },
	{ value: "CASH_AND_MOBILE_BANKING", label: "Cash + Mobile Banking" },
	{ value: "CASH_AND_CREDIT", label: "Cash + Credit" },
	{ value: "CARD_AND_MOBILE_BANKING", label: "Card + Mobile Banking" },
	{ value: "CARD_AND_CREDIT", label: "Card + Credit" },
	{ value: "MOBILE_BANKING_AND_CREDIT", label: "Mobile Banking + Credit" },
];

export function RecordPaymentModal({ purchase, onClose }: Props) {
	const { symbol } = useCurrency();
	const {
		mutate: recordPayment,
		isPending,
		isSuccess,
	} = useRecordPurchasePayment();
	const due = Number(purchase.due);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<RecordPurchasePaymentForm>({
		resolver: zodResolver(recordPurchasePaymentSchema),
		defaultValues: {
			amount: due,
			method: "CASH",
			note: "",
		},
	});

	if (isSuccess) {
		onClose();
	}

	const onSubmit = (values: RecordPurchasePaymentForm) => {
		recordPayment({
			purchaseId: purchase.id,
			payload: {
				amount: values.amount,
				method: values.method,
				note: values.note || null,
				paidAt: values.paidAt || undefined,
			},
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
			<div className="flex items-center justify-between pb-2 border-b">
				<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
					Purchase{" "}
					<span className="font-mono">
						#{purchase.id.slice(0, 8).toUpperCase()}
					</span>
				</p>
				<span className="text-sm font-semibold text-destructive">
					Due: {symbol}
					{due.toFixed(2)}
				</span>
			</div>

			<Field>
				<FieldLabel>Amount</FieldLabel>
				<Input
					type="number"
					step="0.01"
					max={due}
					{...register("amount", { valueAsNumber: true })}
				/>
				{errors.amount && <FieldError>{errors.amount.message}</FieldError>}
			</Field>

			<Field>
				<FieldLabel>Payment Method</FieldLabel>
				<Select
					value={watch("method")}
					onValueChange={(value) =>
						setValue("method", value as RecordPurchasePaymentForm["method"], {
							shouldValidate: true,
						})
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select method" />
					</SelectTrigger>
					<SelectContent>
						{PAYMENT_METHODS.map((m) => (
							<SelectItem key={m.value} value={m.value}>
								{m.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{errors.method && <FieldError>{errors.method.message}</FieldError>}
			</Field>

			<Field>
				<FieldLabel>Note</FieldLabel>
				<Textarea
					rows={3}
					className="resize-none"
					placeholder="Optional note..."
					{...register("note")}
				/>
			</Field>

			<div className="flex justify-end gap-3 pt-2 border-t">
				<Button
					type="button"
					variant="ghost"
					onClick={onClose}
					disabled={isPending}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending || due <= 0}>
					{isPending ? "Recording..." : "Record Payment"}
				</Button>
			</div>
		</form>
	);
}
