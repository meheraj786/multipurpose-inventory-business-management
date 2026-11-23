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
import { useRawProductStockIn } from "@/hooks/useRawProducts";
import type { RawProduct } from "@/lib/api/services/rawProduct.service";
import {
	type RawProductStockInForm,
	rawProductStockInSchema,
} from "@/validation/rawProduct.schema";

type Props = {
	rawProduct: RawProduct;
	onClose: () => void;
};

export function StockInDialog({ rawProduct, onClose }: Props) {
	const { mutate: stockIn, isPending } = useRawProductStockIn(rawProduct.id);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RawProductStockInForm>({
		resolver: zodResolver(rawProductStockInSchema),
		defaultValues: { quantity: 0 },
	});

	const currentStock = rawProduct.currentStock ?? rawProduct.totalStock ?? 0;

	const onSubmit = (values: RawProductStockInForm) => {
		stockIn(values, { onSuccess: onClose });
	};

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add Stock — {rawProduct.name}</DialogTitle>
					<DialogDescription>
						Current stock: {currentStock} {rawProduct.unit?.symbol}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<Field>
						<FieldLabel htmlFor="quantity">
							Quantity ({rawProduct.unit?.symbol})
						</FieldLabel>
						<Input
							id="quantity"
							type="number"
							step="0.0001"
							{...register("quantity", { valueAsNumber: true })}
						/>
						{errors.quantity && (
							<FieldError>{errors.quantity.message}</FieldError>
						)}
					</Field>

					<Field>
						<FieldLabel htmlFor="totalCost">Total Cost (optional)</FieldLabel>
						<Input
							id="totalCost"
							type="number"
							step="0.01"
							{...register("totalCost", { valueAsNumber: true })}
						/>
					</Field>

					<Field>
						<FieldLabel htmlFor="batch">Batch (optional)</FieldLabel>
						<Input id="batch" {...register("batch")} />
					</Field>

					<DialogFooter>
						<Button type="button" variant="ghost" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Saving..." : "Add Stock"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
