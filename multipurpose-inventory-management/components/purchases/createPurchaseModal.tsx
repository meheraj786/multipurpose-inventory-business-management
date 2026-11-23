"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useGetProducts } from "@/hooks/useProducts";
import { useCreatePurchaseWithPayment } from "@/hooks/usePurchases";
import { useGetSuppliers } from "@/hooks/useSuppliers";
import {
	type CreatePurchaseForm,
	createPurchaseSchema,
} from "@/validation/purchase.schema";

type Props = {
	initialProductId?: string;
	onClose: () => void;
};

const PAYMENT_METHODS: { value: string; label: string }[] = [
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

export function CreatePurchaseModal({ initialProductId, onClose }: Props) {
	const { data: supplierResult } = useGetSuppliers({ page: 1, pageSize: 200 });
	const { data: productResult } = useGetProducts({ page: 1, pageSize: 500 });
	const suppliers = supplierResult?.data ?? [];
	const products = productResult?.data ?? [];

	const {
		mutate: createPurchase,
		isPending,
		isSuccess,
	} = useCreatePurchaseWithPayment();

	const {
		register,
		handleSubmit,
		control,
		watch,
		setValue,
		formState: { errors },
	} = useForm<CreatePurchaseForm>({
		resolver: zodResolver(createPurchaseSchema),
		defaultValues: {
			supplierId: undefined,
			notes: "",
			paymentOption: "FULL",
			paymentAmount: undefined,
			paymentMethod: "CASH",
			paymentNote: "",
			items: [
				{
					productId: initialProductId || "",
					unitId: undefined,
					quantity: 1,
					purchasePrice: 0,
					batch: "",
					notes: "",
				},
			],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "items",
	});

	useEffect(() => {
		if (isSuccess) onClose();
	}, [isSuccess, onClose]);

	const items = watch("items");
	const paymentOption = watch("paymentOption");
	const total = items.reduce(
		(sum, item) =>
			sum + (Number(item.quantity) || 0) * (Number(item.purchasePrice) || 0),
		0,
	);

	useEffect(() => {
		if (paymentOption === "FULL") {
			setValue("paymentAmount", total, { shouldValidate: true });
		}
		if (paymentOption === "DUE") {
			setValue("paymentAmount", undefined);
		}
	}, [paymentOption, total, setValue]);

	const onSubmit = (values: CreatePurchaseForm) => {
		createPurchase(values);
	};

	const addItem = () => {
		append({
			productId: "",
			unitId: undefined,
			quantity: 1,
			purchasePrice: 0,
			batch: "",
			notes: "",
		});
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col h-full max-h-[85vh]"
		>
			<div className="flex-1 overflow-y-auto p-6 space-y-4">
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

				<Separator />

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
							Items
						</p>
						<Button type="button" variant="outline" size="sm" onClick={addItem}>
							<Plus className="mr-2 h-3.5 w-3.5" />
							Add Item
						</Button>
					</div>

					{fields.map((field, index) => (
						<div
							key={field.id}
							className="rounded-lg border p-4 space-y-3 relative"
						>
							{fields.length > 1 && (
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute top-2 right-2 h-7 w-7 text-destructive hover:text-destructive"
									onClick={() => remove(index)}
								>
									<Trash2 className="h-3.5 w-3.5" />
								</Button>
							)}

							<Field>
								<FieldLabel>Product</FieldLabel>
								<SearchableCombobox
									value={items[index]?.productId ?? ""}
									onChange={(value) =>
										setValue(`items.${index}.productId`, value, {
											shouldDirty: true,
											shouldValidate: true,
										})
									}
									options={products.map((product) => ({
										value: product.id,
										label: product.name,
									}))}
									placeholder="Select product"
									searchPlaceholder="Search product..."
									emptyText="No product found."
								/>
								{errors.items?.[index]?.productId && (
									<FieldError>
										{errors.items[index]?.productId?.message}
									</FieldError>
								)}
							</Field>

							<div className="grid grid-cols-2 gap-3">
								<Field>
									<FieldLabel>Quantity</FieldLabel>
									<Input
										type="number"
										step="0.0001"
										{...register(`items.${index}.quantity`, {
											valueAsNumber: true,
										})}
									/>
									{errors.items?.[index]?.quantity && (
										<FieldError>
											{errors.items[index]?.quantity?.message}
										</FieldError>
									)}
								</Field>
								<Field>
									<FieldLabel>Purchase Price (Per Unit)</FieldLabel>
									<Input
										type="number"
										step="0.01"
										{...register(`items.${index}.purchasePrice`, {
											valueAsNumber: true,
										})}
									/>
									{errors.items?.[index]?.purchasePrice && (
										<FieldError>
											{errors.items[index]?.purchasePrice?.message}
										</FieldError>
									)}
								</Field>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<Field>
									<FieldLabel>Batch (optional)</FieldLabel>
									<Input {...register(`items.${index}.batch`)} />
								</Field>
								<Field>
									<FieldLabel>Line Total</FieldLabel>
									<Input
										disabled
										value={(
											(Number(items[index]?.quantity) || 0) *
											(Number(items[index]?.purchasePrice) || 0)
										).toFixed(2)}
									/>
								</Field>
							</div>
						</div>
					))}
					{errors.items && !Array.isArray(errors.items) && (
						<FieldError>{errors.items.message}</FieldError>
					)}
				</div>

				<Separator />

				<div className="space-y-3">
					<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
						Payment
					</p>
					<RadioGroup
						value={paymentOption}
						onValueChange={(value) =>
							setValue(
								"paymentOption",
								value as CreatePurchaseForm["paymentOption"],
								{
									shouldValidate: true,
								},
							)
						}
						className="grid grid-cols-3 gap-3"
					>
						<label
							htmlFor="due-option"
							className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${
								paymentOption === "DUE" ? "border-primary bg-primary/5" : ""
							}`}
						>
							<RadioGroupItem id="due-option" value="DUE" />
							Full Due
						</label>
						<label
							htmlFor="partial-option"
							className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${
								paymentOption === "PARTIAL" ? "border-primary bg-primary/5" : ""
							}`}
						>
							<RadioGroupItem id="partial-option" value="PARTIAL" />
							Partial
						</label>
						<label
							htmlFor="full-option"
							className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${
								paymentOption === "FULL" ? "border-primary bg-primary/5" : ""
							}`}
						>
							<RadioGroupItem id="full-option" value="FULL" />
							Full Paid
						</label>
					</RadioGroup>

					{paymentOption !== "DUE" && (
						<div className="grid grid-cols-2 gap-3">
							<Field>
								<FieldLabel>Amount</FieldLabel>
								<Input
									type="number"
									step="0.01"
									max={total}
									disabled={paymentOption === "FULL"}
									{...register("paymentAmount", { valueAsNumber: true })}
								/>
								{errors.paymentAmount && (
									<FieldError>{errors.paymentAmount.message}</FieldError>
								)}
							</Field>
							<Field>
								<FieldLabel>Payment Method</FieldLabel>
								<Select
									value={watch("paymentMethod")}
									onValueChange={(value) =>
										setValue(
											"paymentMethod",
											value as CreatePurchaseForm["paymentMethod"],
											{ shouldValidate: true },
										)
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
								{errors.paymentMethod && (
									<FieldError>{errors.paymentMethod.message}</FieldError>
								)}
							</Field>
						</div>
					)}

					{paymentOption !== "DUE" && (
						<Field>
							<FieldLabel>Payment Note (optional)</FieldLabel>
							<Input
								placeholder="e.g. Advance paid at delivery"
								{...register("paymentNote")}
							/>
						</Field>
					)}
				</div>

				<Separator />

				<Field>
					<FieldLabel>Notes</FieldLabel>
					<Textarea
						rows={3}
						className="resize-none"
						placeholder="Optional notes for this purchase..."
						{...register("notes")}
					/>
				</Field>
			</div>

			<div className="flex items-center justify-between p-6 border-t bg-neutral-50 dark:bg-neutral-900 rounded-b-lg">
				<div>
					<p className="text-xs text-muted-foreground uppercase tracking-wider">
						Total
					</p>
					<p className="text-lg font-bold tabular-nums">{total.toFixed(2)}</p>
					{paymentOption !== "DUE" && (
						<p className="text-xs text-muted-foreground">
							Due after save:{" "}
							{Math.max(
								total - (Number(watch("paymentAmount")) || 0),
								0,
							).toFixed(2)}
						</p>
					)}
				</div>
				<div className="flex gap-3">
					<Button
						type="button"
						variant="ghost"
						onClick={onClose}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending ? "Creating..." : "Create Purchase"}
					</Button>
				</div>
			</div>
		</form>
	);
}
