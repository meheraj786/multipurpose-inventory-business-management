"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useProduceStock } from "@/hooks/usePreparedProducts";
import type { PreparedProduct } from "@/lib/api/services/preparedProduct.service";
import {
	type ProduceStockForm,
	produceStockSchema,
} from "@/validation/preparedProduct.schema";

type Props = {
	preparedProduct: PreparedProduct;
	onClose: () => void;
};

export function ProduceDialog({ preparedProduct, onClose }: Props) {
	const {
		mutate: produce,
		isPending,
		error,
	} = useProduceStock(preparedProduct.id);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ProduceStockForm>({
		resolver: zodResolver(produceStockSchema),
		defaultValues: { quantity: 1 },
	});

	// Surfaces the backend's "Insufficient stock for raw product: X" error
	// (thrown from PreparedProductService.produceStock) directly in the dialog.
	const apiError = (
		error as { response?: { data?: { message?: string } } } | undefined
	)?.response?.data?.message;

	const onSubmit = (values: ProduceStockForm) => {
		produce(values.quantity, { onSuccess: onClose });
	};

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Produce — {preparedProduct.name}</DialogTitle>
					<DialogDescription>
						Current stock: {preparedProduct.totalStock}{" "}
						{preparedProduct.unit?.symbol}. Producing consumes raw materials per
						the recipe.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<Field>
						<FieldLabel htmlFor="quantity">
							Quantity to produce ({preparedProduct.unit?.symbol})
						</FieldLabel>
						<Input
							id="quantity"
							type="number"
							step="1"
							min={1}
							{...register("quantity", { valueAsNumber: true })}
						/>
						{errors.quantity && (
							<FieldError>{errors.quantity.message}</FieldError>
						)}
					</Field>

					{apiError && (
						<p className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive">
							{apiError}
						</p>
					)}

					<DialogFooter>
						<Button type="button" variant="ghost" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Producing..." : "Produce"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
