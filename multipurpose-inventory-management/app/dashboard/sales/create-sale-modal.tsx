"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { useCurrency } from "@/hooks/useCurrency";
import { useGetCustomers } from "@/hooks/useCustomer";
import { useGetProducts } from "@/hooks/useProducts";
import { useCreateSale } from "@/hooks/useSale";
import { useGetServices } from "@/hooks/useService";
import { type Unit, useGetUnits } from "@/hooks/useUnits";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
	type CreateSaleForm,
	createSaleSchema,
	HYBRID_PARTS,
	isHybrid,
	modelHasItems,
	modelHasServices,
	PAYMENT_METHOD_LABELS,
	PAYMENT_METHODS,
	type PaymentMethod,
} from "@/validation/sale.schema";

type Props = { onClose: () => void };

export function CreateSaleModal({ onClose }: Props) {
	const model = useAuthStore((s) => s.user?.account.model) ?? "SERVICE";
	const { symbol } = useCurrency();

	const showItems = modelHasItems(model);
	const showServices = modelHasServices(model);

	const { data: customerResult } = useGetCustomers({ page: 1, pageSize: 100 });
	const { data: serviceResult } = useGetServices({ page: 1, pageSize: 100 });
	const { data: productResult } = useGetProducts({ page: 1, pageSize: 200 });
	const { data: unitResult } = useGetUnits();

	const customers = customerResult?.data ?? [];
	const services = serviceResult?.data ?? [];
	const products = productResult?.data ?? [];
	const units = unitResult?.data ?? [];

	const { mutate: createSale, isPending } = useCreateSale();

	const {
		register,
		handleSubmit,
		control,
		setValue,
		formState: { errors },
	} = useForm<CreateSaleForm>({
		resolver: zodResolver(createSaleSchema),
		defaultValues: {
			paymentMethod: "CASH",
			discount: 0,
			due: 0,
			payments: [],
			saleItems: [],
			saleServices: [],
		},
	});

	const {
		fields: itemFields,
		append: appendItem,
		remove: removeItem,
	} = useFieldArray({ control, name: "saleItems" });

	const {
		fields: serviceFields,
		append: appendService,
		remove: removeService,
	} = useFieldArray({ control, name: "saleServices" });

	const watchedItems = useWatch({ control, name: "saleItems" }) ?? [];
	const watchedServices = useWatch({ control, name: "saleServices" }) ?? [];
	const watchedDiscount = useWatch({ control, name: "discount" }) ?? 0;
	const selectedCustomerId = useWatch({ control, name: "customerId" }) ?? "";
	const selectedMethod = useWatch({ control, name: "paymentMethod" });

	const hybrid = isHybrid(selectedMethod);
	const hybridParts = hybrid ? HYBRID_PARTS[selectedMethod] : null;

	const itemsTotal = watchedItems.reduce(
		(sum, i) =>
			sum +
			Number(i.sellPrice || 0) * Number(i.quantity || 0) -
			Number(i.discount || 0),
		0,
	);

	const servicesTotal = watchedServices.reduce(
		(sum, s) =>
			sum +
			Number(s.unitPrice || 0) * Number(s.quantity || 0) -
			Number(s.discount || 0),
		0,
	);

	const grandTotal = Math.max(
		0,
		itemsTotal + servicesTotal - Number(watchedDiscount),
	);

	const handleMethodChange = (method: string) => {
		setValue("paymentMethod", method as PaymentMethod);
		if (isHybrid(method)) {
			const parts = HYBRID_PARTS[method];
			setValue("payments", [
				{ method: parts[0], amount: 0 },
				{ method: parts[1], amount: 0, transactionId: "" },
			]);
		} else {
			setValue("payments", []);
		}
	};

	const needsTransactionId = (method: string) =>
		["CARD", "MOBILE_BANKING", "CREDIT"].includes(method);

	const onSubmit = (values: CreateSaleForm) => {
		const cleaned: CreateSaleForm = {
			...values,
			saleItems: (values.saleItems ?? []).filter(
				(i) => i.productId && i.productId.trim() !== "",
			),
			saleServices: (values.saleServices ?? []).filter(
				(s) => s.serviceId && s.serviceId.trim() !== "",
			),
		};
		createSale(cleaned, { onSuccess: onClose });
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-6 p-6 max-h-[80vh] overflow-y-auto"
		>
			{/* Customer & Payment Section (unchanged) */}
			<div>
				<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pb-2 border-b mb-4">
					Customer & Payment
				</p>
				<div className="grid grid-cols-2 gap-4">
					<Field>
						<FieldLabel htmlFor="customerId">Customer</FieldLabel>
						<SearchableCombobox
							value={selectedCustomerId}
							onChange={(value) =>
								setValue("customerId", value, {
									shouldDirty: true,
									shouldValidate: true,
								})
							}
							options={customers.map((customer) => ({
								value: customer.id,
								label: customer.name,
								description: customer.phone,
								searchValue: `${customer.name} ${customer.phone ?? ""}`,
							}))}
							placeholder="Walk-in / No customer"
							searchPlaceholder="Search customer..."
							emptyText="No customer found."
							clearLabel="Walk-in / No customer"
						/>
					</Field>

					<Field>
						<FieldLabel htmlFor="customerNumber">Customer Number</FieldLabel>
						<Input
							id="customerNumber"
							placeholder="e.g., #1234"
							{...register("customerNumber")}
						/>
					</Field>

					<Field className="col-span-2">
						<FieldLabel htmlFor="paymentMethod">Payment Method</FieldLabel>
						<select
							id="paymentMethod"
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							{...register("paymentMethod")}
							onChange={(e) => handleMethodChange(e.target.value)}
						>
							{PAYMENT_METHODS.map((m) => (
								<option key={m} value={m}>
									{PAYMENT_METHOD_LABELS[m]}
								</option>
							))}
						</select>
					</Field>

					{hybrid && hybridParts && (
						<div className="col-span-2 grid grid-cols-2 gap-4 p-4 border rounded-md bg-muted/30">
							<p className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Payment Breakdown
							</p>
							<Field>
								<FieldLabel className="text-xs">
									{PAYMENT_METHOD_LABELS[hybridParts[0]]} Amount
								</FieldLabel>
								<Input
									type="number"
									step="0.01"
									placeholder="0.00"
									{...register("payments.0.amount", { valueAsNumber: true })}
								/>
							</Field>
							{needsTransactionId(hybridParts[0]) && (
								<Field>
									<FieldLabel className="text-xs">Transaction ID</FieldLabel>
									<Input {...register("payments.0.transactionId")} />
								</Field>
							)}

							<Field>
								<FieldLabel className="text-xs">
									{PAYMENT_METHOD_LABELS[hybridParts[1]]} Amount
								</FieldLabel>
								<Input
									type="number"
									step="0.01"
									placeholder="0.00"
									{...register("payments.1.amount", { valueAsNumber: true })}
								/>
							</Field>
							{needsTransactionId(hybridParts[1]) && (
								<Field>
									<FieldLabel className="text-xs">Transaction ID</FieldLabel>
									<Input {...register("payments.1.transactionId")} />
								</Field>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Products Section */}
			{showItems && (
				<div>
					<div className="flex items-center justify-between pb-2 border-b mb-4">
						<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
							Products
						</p>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() =>
								appendItem({
									productId: "",
									unitId: "",
									quantity: 1,
									sellPrice: 0,
									discount: 0,
									itemType: "PRODUCT",
								})
							}
						>
							<Plus className="h-3 w-3 mr-1" /> Add Product
						</Button>
					</div>
					<div className="space-y-2">
						{itemFields.map((field, index) => (
							<div
								key={field.id}
								className="grid grid-cols-12 gap-2 items-end p-3 border rounded-md"
							>
								{/* ... existing fields (Product, Unit, Qty, Price) ... */}
								<div className="col-span-4">
									<FieldLabel className="text-xs">Product</FieldLabel>
									<SearchableCombobox
										value={watchedItems[index]?.productId ?? ""}
										onChange={(value) => {
											const prod = products.find((p) => p.id === value);
											setValue(`saleItems.${index}.productId`, value, {
												shouldDirty: true,
												shouldValidate: true,
											});
											if (prod) {
												setValue(
													`saleItems.${index}.sellPrice`,
													Number(prod.defaultSalePrice ?? 0),
													{ shouldDirty: true, shouldValidate: true },
												);
												if (prod.unitId) {
													setValue(`saleItems.${index}.unitId`, prod.unitId, {
														shouldDirty: true,
														shouldValidate: true,
													});
												}
											}
										}}
										options={products.map((product) => ({
											value: product.id,
											label: product.name,
											description: product.sku ? `SKU: ${product.sku}` : null,
											searchValue: `${product.name} ${product.sku ?? ""}`,
										}))}
										placeholder="Select product..."
										searchPlaceholder="Search product..."
										emptyText="No product found."
										clearLabel="No product"
										className="h-9"
									/>
									{errors.saleItems?.[index]?.productId && (
										<FieldError>
											{errors.saleItems[index]?.productId?.message}
										</FieldError>
									)}
								</div>

								<div className="col-span-2">
									<FieldLabel className="text-xs">Unit</FieldLabel>
									<SearchableCombobox
										value={watchedItems[index]?.unitId ?? ""}
										onChange={(value) =>
											setValue(`saleItems.${index}.unitId`, value, {
												shouldDirty: true,
												shouldValidate: true,
											})
										}
										options={units.map((unit: Unit) => ({
											value: unit.id,
											label: unit.symbol,
											description: unit.name,
											searchValue: `${unit.symbol} ${unit.name}`,
										}))}
										placeholder="Unit"
										searchPlaceholder="Search unit..."
										emptyText="No unit found."
										clearLabel="No unit"
										className="h-9"
									/>
								</div>

								<div className="col-span-2">
									<FieldLabel className="text-xs">Qty</FieldLabel>
									<Input
										type="number"
										step="0.0001"
										className="h-9"
										{...register(`saleItems.${index}.quantity`, {
											valueAsNumber: true,
										})}
									/>
								</div>

								<div className="col-span-2">
									<FieldLabel className="text-xs">Price</FieldLabel>
									<Input
										type="number"
										step="0.01"
										className="h-9"
										{...register(`saleItems.${index}.sellPrice`, {
											valueAsNumber: true,
										})}
									/>
								</div>

								<div className="col-span-1 flex justify-end pb-0.5">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => removeItem(index)} // ← Removed disabled condition
									>
										<Trash2 className="h-4 w-4 text-destructive" />
									</Button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Services Section */}
			{showServices && (
				<div>
					<div className="flex items-center justify-between pb-2 border-b mb-4">
						<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
							Services
						</p>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() =>
								appendService({
									serviceId: "",
									quantity: 1,
									unitPrice: 0,
									discount: 0,
								})
							}
						>
							<Plus className="h-3 w-3 mr-1" /> Add Service
						</Button>
					</div>
					<div className="space-y-2">
						{serviceFields.map((field, index) => (
							<div
								key={field.id}
								className="grid grid-cols-12 gap-2 items-end p-3 border rounded-md"
							>
								{/* Service fields... */}
								<div className="col-span-5">
									<FieldLabel className="text-xs">Service</FieldLabel>
									<SearchableCombobox
										value={watchedServices[index]?.serviceId ?? ""}
										onChange={(value) => {
											const svc = services.find((s) => s.id === value);
											setValue(`saleServices.${index}.serviceId`, value, {
												shouldDirty: true,
												shouldValidate: true,
											});
											if (svc) {
												setValue(
													`saleServices.${index}.unitPrice`,
													Number(svc.salePrice ?? 0),
													{ shouldDirty: true, shouldValidate: true },
												);
											}
										}}
										options={services.map((service) => ({
											value: service.id,
											label: service.name,
											description: `${symbol}${Number(service.salePrice).toFixed(2)}`,
											searchValue: service.name,
										}))}
										placeholder="Select service..."
										searchPlaceholder="Search service..."
										emptyText="No service found."
										clearLabel="No service"
										className="h-9"
									/>
								</div>

								<div className="col-span-2">
									<FieldLabel className="text-xs">Qty</FieldLabel>
									<Input
										type="number"
										min={1}
										className="h-9"
										{...register(`saleServices.${index}.quantity`, {
											valueAsNumber: true,
										})}
									/>
								</div>

								<div className="col-span-2">
									<FieldLabel className="text-xs">Price</FieldLabel>
									<Input
										type="number"
										step="0.01"
										className="h-9"
										{...register(`saleServices.${index}.unitPrice`, {
											valueAsNumber: true,
										})}
									/>
								</div>

								<div className="col-span-2">
									<FieldLabel className="text-xs">Discount</FieldLabel>
									<Input
										type="number"
										step="0.01"
										className="h-9"
										{...register(`saleServices.${index}.discount`, {
											valueAsNumber: true,
										})}
									/>
								</div>

								<div className="col-span-1 flex justify-end pb-0.5">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => removeService(index)} // ← Removed disabled
									>
										<Trash2 className="h-4 w-4 text-destructive" />
									</Button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Summary Section (unchanged) */}
			<div className="border rounded-md p-4 space-y-3 bg-muted/30">
				<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pb-2 border-b">
					Summary
				</p>
				{showItems && (
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Products Subtotal</span>
						<span className="tabular-nums">
							{symbol}
							{itemsTotal.toFixed(2)}
						</span>
					</div>
				)}
				{showServices && (
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Services Subtotal</span>
						<span className="tabular-nums">
							{symbol}
							{servicesTotal.toFixed(2)}
						</span>
					</div>
				)}
				<div className="flex justify-between items-center text-sm">
					<span className="text-muted-foreground">Overall Discount</span>
					<Input
						type="number"
						step="0.01"
						className="h-7 w-28 text-right"
						{...register("discount", { valueAsNumber: true })}
					/>
				</div>
				<div className="flex justify-between items-center text-sm">
					<span className="text-muted-foreground">Due Amount</span>
					<Input
						type="number"
						step="0.01"
						className="h-7 w-28 text-right"
						{...register("due", { valueAsNumber: true })}
					/>
				</div>
				<div className="flex justify-between font-semibold text-base pt-2 border-t">
					<span>Grand Total</span>
					<span className="tabular-nums">
						{symbol}
						{grandTotal.toFixed(2)}
					</span>
				</div>
			</div>

			<div className="flex justify-end gap-3 pt-2">
				<Button type="button" variant="ghost" onClick={onClose}>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? "Creating..." : "Create Sale"}
				</Button>
			</div>
		</form>
	);
}
