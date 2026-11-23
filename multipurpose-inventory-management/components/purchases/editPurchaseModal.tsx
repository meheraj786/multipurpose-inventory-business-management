"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { Textarea } from "@/components/ui/textarea";
import { useUpdatePurchase } from "@/hooks/usePurchases";
import { useGetSuppliers } from "@/hooks/useSuppliers";
import type { Purchase } from "@/lib/api/services/purchase.service";
import {
	type UpdatePurchaseForm,
	updatePurchaseSchema,
} from "@/validation/purchase.schema";

type Props = {
	purchase: Purchase;
	onClose: () => void;
};

export function EditPurchaseModal({ purchase, onClose }: Props) {
	const { data: supplierResult } = useGetSuppliers({ page: 1, pageSize: 200 });
	const suppliers = supplierResult?.data ?? [];

	const { mutate: updatePurchase, isPending, isSuccess } = useUpdatePurchase();
	const paidAmount = Number(purchase.paidAmount);

	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors },
	} = useForm<UpdatePurchaseForm>({
		resolver: zodResolver(updatePurchaseSchema),
		defaultValues: {
			supplierId: purchase.supplierId ?? undefined,
			qty: Number(purchase.qty),
			purchasePrice: Number(purchase.purchasePrice),
			rate: Number(purchase.rate ?? 0),
			notes: purchase.notes ?? "",
		},
	});

	useEffect(() => {
		reset({
			supplierId: purchase.supplierId ?? undefined,
			qty: Number(purchase.qty),
			purchasePrice: Number(purchase.purchasePrice),
			rate: Number(purchase.rate ?? 0),
			notes: purchase.notes ?? "",
		});
	}, [purchase, reset]);

	useEffect(() => {
		if (isSuccess) onClose();
	}, [isSuccess, onClose]);

	const onSubmit = (values: UpdatePurchaseForm) => {
		updatePurchase({
			id: purchase.id,
			payload: {
				supplierId: values.supplierId || null,
				qty: values.qty,
				purchasePrice: values.purchasePrice,
				rate: values.rate,
				notes: values.notes || null,
			},
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
			<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pb-2 border-b">
				Purchase{" "}
				<span className="font-mono">
					#{purchase.id.slice(0, 8).toUpperCase()}
				</span>
			</p>

			{paidAmount > 0 && (
				<p className="text-xs rounded-md bg-amber-50 text-amber-700 border border-amber-200 px-3 py-2">
					{paidAmount.toFixed(2)} already paid toward this purchase. The new
					total cannot be reduced below this amount.
				</p>
			)}

			<Field>
				<FieldLabel>Supplier</FieldLabel>
				<SearchableCombobox
					value={watch("supplierId") ?? ""}
					onChange={(value) =>
						setValue("supplierId", value, {
							shouldDirty: true,
							shouldValidate: true,
						})
					}
					options={suppliers.map((supplier) => ({
						value: supplier.id,
						label: supplier.name,
					}))}
					placeholder="No supplier"
					searchPlaceholder="Search supplier..."
					emptyText="No supplier found."
					clearLabel="No supplier"
				/>
			</Field>

			<div className="grid grid-cols-2 gap-4">
				<Field>
					<FieldLabel>Quantity</FieldLabel>
					<Input
						type="number"
						step="0.0001"
						{...register("qty", { valueAsNumber: true })}
					/>
					{errors.qty && <FieldError>{errors.qty.message}</FieldError>}
				</Field>
				<Field>
					<FieldLabel>Purchase Price</FieldLabel>
					<Input
						type="number"
						step="0.01"
						{...register("purchasePrice", { valueAsNumber: true })}
					/>
					{errors.purchasePrice && (
						<FieldError>{errors.purchasePrice.message}</FieldError>
					)}
				</Field>
			</div>

			<Field>
				<FieldLabel>Rate (optional)</FieldLabel>
				<Input
					type="number"
					step="0.01"
					placeholder="0.00"
					{...register("rate", { valueAsNumber: true })}
				/>
			</Field>

			<Field>
				<FieldLabel>Notes</FieldLabel>
				<Textarea
					rows={3}
					className="resize-none"
					placeholder="Optional notes..."
					{...register("notes")}
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
				<Button type="submit" disabled={isPending}>
					{isPending ? "Saving..." : "Save Changes"}
				</Button>
			</div>
		</form>
	);
}
