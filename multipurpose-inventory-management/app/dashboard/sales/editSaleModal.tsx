"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChefHat, Plus, Receipt, Trash2, Wallet } from "lucide-react";
import { useCallback, useEffect } from "react";
import {
	type SubmitHandler,
	useFieldArray,
	useForm,
	useWatch,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { useCurrency } from "@/hooks/useCurrency";
import { useGetCustomers } from "@/hooks/useCustomer";
import { useGetPreparedProducts } from "@/hooks/usePreparedProducts";
import { useGetProducts } from "@/hooks/useProducts";
import { type Sale, useUpdateSale } from "@/hooks/useSale";
import { useGetServices } from "@/hooks/useService";
import { type Unit, useGetUnits } from "@/hooks/useUnits";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
	HYBRID_PARTS,
	isHybrid,
	modelHasItems,
	modelHasPreparedProducts,
	modelHasServices,
	PAYMENT_METHOD_LABELS,
	PAYMENT_METHODS,
	type PaymentMethod,
	type UpdateSaleForm,
	updateSaleSchema,
} from "@/validation/sale.schema";

type Props = { sale: Sale; onClose: () => void };

// Combined option for the item picker — represents either a Product or a
// PreparedProduct, disambiguated by a prefixed value ("product:<id>" /
// "prepared:<id>") so a single dropdown can offer both without the form
// needing two separate line-item arrays. Mirrors the picker used on the
// Create Sale page.
type ItemOption = {
	value: string;
	itemType: "PRODUCT" | "PREPARED_PRODUCT";
	id: string;
	label: string;
	description: string | null;
	searchValue: string;
	unitId: string;
	sellPrice: number;
};

export function EditSaleModal({ sale, onClose }: Props) {
	const model = useAuthStore((s) => s.user?.account.model) ?? "SERVICE";
	const { symbol } = useCurrency();
	const showItems = modelHasItems(model);
	const showServices = modelHasServices(model);
	const showPrepared = modelHasPreparedProducts(model);
	const showItemsCard = showItems || showPrepared;

	const { data: customerResult } = useGetCustomers({ page: 1, pageSize: 100 });
	const { data: serviceResult } = useGetServices({ page: 1, pageSize: 100 });
	const { data: productResult } = useGetProducts({ page: 1, pageSize: 200 });
	const { data: preparedResult } = useGetPreparedProducts(
		{ page: 1, pageSize: 200 },
		{ enabled: showPrepared },
	);
	const { data: unitResult } = useGetUnits();

	const customers = customerResult?.data ?? [];
	const services = serviceResult?.data ?? [];
	const products = showItems ? (productResult?.data ?? []) : [];
	const preparedProducts = showPrepared ? (preparedResult?.data ?? []) : [];
	const units = unitResult?.data ?? [];

	const itemOptions: ItemOption[] = [
		...products.map((product) => ({
			value: `product:${product.id}`,
			itemType: "PRODUCT" as const,
			id: product.id,
			label: product.name,
			description: product.sku ? `SKU: ${product.sku}` : "Product",
			searchValue: `${product.name} ${product.sku ?? ""}`,
			unitId: product.unitId ?? "",
			sellPrice: Number(product.defaultSalePrice ?? 0),
		})),
		...preparedProducts.map((pp) => ({
			value: `prepared:${pp.id}`,
			itemType: "PREPARED_PRODUCT" as const,
			id: pp.id,
			label: pp.name,
			description: `Menu item · ${symbol}${Number(pp.defaultSalePrice ?? 0).toFixed(2)}`,
			searchValue: pp.name,
			unitId: pp.unitId ?? "",
			sellPrice: Number(pp.defaultSalePrice ?? 0),
		})),
	];

	const itemsCardTitle =
		showItems && showPrepared
			? "Products & Menu Items"
			: showPrepared
				? "Menu Items"
				: "Products";

	const { mutate: updateSale, isPending } = useUpdateSale();

	const buildDefaults = useCallback(
		(s: Sale): UpdateSaleForm => ({
			customerId: s.customerId ?? "",
			customerNumber: s.customerNumber ?? "",
			paymentMethod: s.paymentMethod as PaymentMethod,
			payments: s.payments ?? [],
			discount: Number(s.discount || 0),
			due: Number(s.due || 0),
			saleItems:
				s.saleItems?.map((i) => ({
					itemType: i.itemType ?? "PRODUCT",
					productId: i.productId ?? "",
					preparedProductId: i.preparedProductId ?? "",
					// Previously always blanked out — the backend does return
					// unitId on every SaleItem row, so pre-fill it for real.
					unitId: i.unitId ?? "",
					quantity: i.quantity,
					sellPrice: Number(i.sellPrice),
					discount: Number(i.discount || 0),
				})) ?? [],
			saleServices:
				s.saleServices?.map((sv) => ({
					serviceId: sv.serviceId,
					quantity: sv.quantity,
					unitPrice: Number(sv.unitPrice),
					discount: Number(sv.discount || 0),
				})) ?? [],
		}),
		[],
	);

	const {
		register,
		handleSubmit,
		control,
		setValue,
		reset,
		formState: { errors },
	} = useForm<UpdateSaleForm>({
		resolver: zodResolver(updateSaleSchema),
		defaultValues: buildDefaults(sale),
	});

	useEffect(() => {
		reset(buildDefaults(sale));
	}, [sale, reset, buildDefaults]);

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

	const hybrid = isHybrid(selectedMethod ?? "");
	const hybridParts =
		hybrid && selectedMethod ? HYBRID_PARTS[selectedMethod] : null;

	const needsTransactionId = (method: string) =>
		["CARD", "MOBILE_BANKING", "CREDIT"].includes(method);

	const singleTransactional =
		!hybrid && !!selectedMethod && needsTransactionId(selectedMethod);

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

	// Non-hybrid single method: treat it as a "hybrid of one" so CARD,
	// MOBILE_BANKING, and CREDIT sales also capture a transaction ID —
	// previously only hybrid combos got a transaction ID field at all.
	const handleMethodChange = (method: string) => {
		setValue("paymentMethod", method as PaymentMethod);
		if (isHybrid(method)) {
			const parts = HYBRID_PARTS[method];
			setValue("payments", [
				{ method: parts[0], amount: 0 },
				{ method: parts[1], amount: 0, transactionId: "" },
			]);
		} else if (needsTransactionId(method)) {
			setValue("payments", [
				{ method: method as PaymentMethod, amount: 0, transactionId: "" },
			]);
		} else {
			setValue("payments", []);
		}
	};

	// Selecting an option sets itemType + the matching id, clears the other
	// id, and pre-fills unit/price from whichever catalog it came from.
	const handleItemSelect = (index: number, value: string) => {
		const option = itemOptions.find((o) => o.value === value);
		if (!option) return;

		setValue(`saleItems.${index}.itemType`, option.itemType, {
			shouldDirty: true,
			shouldValidate: true,
		});
		setValue(
			`saleItems.${index}.productId`,
			option.itemType === "PRODUCT" ? option.id : "",
			{ shouldDirty: true, shouldValidate: true },
		);
		setValue(
			`saleItems.${index}.preparedProductId`,
			option.itemType === "PREPARED_PRODUCT" ? option.id : "",
			{ shouldDirty: true, shouldValidate: true },
		);
		setValue(`saleItems.${index}.unitId`, option.unitId, {
			shouldDirty: true,
			shouldValidate: true,
		});
		setValue(`saleItems.${index}.sellPrice`, option.sellPrice, {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	const getSelectedItemValue = (index: number) => {
		const row = watchedItems[index];
		if (!row) return "";
		if (row.itemType === "PREPARED_PRODUCT" && row.preparedProductId) {
			return `prepared:${row.preparedProductId}`;
		}
		if (row.productId) return `product:${row.productId}`;
		return "";
	};

	const onSubmit: SubmitHandler<UpdateSaleForm> = (values) => {
		const collectedNow = Math.max(0, grandTotal - Number(values.due ?? 0));
		const payments = singleTransactional
			? [
					{
						method: values.paymentMethod as PaymentMethod,
						amount: collectedNow,
						transactionId: values.payments?.[0]?.transactionId ?? "",
					},
				]
			: values.payments;

		const cleaned: UpdateSaleForm = {
			...values,
			payments,
			saleItems: (values.saleItems ?? []).filter((i) =>
				i.itemType === "PREPARED_PRODUCT"
					? i.preparedProductId && i.preparedProductId.trim() !== ""
					: i.productId && i.productId.trim() !== "",
			),
			saleServices: (values.saleServices ?? []).filter(
				(s) => s.serviceId && s.serviceId.trim() !== "",
			),
		};
		updateSale({ id: sale.id, ...cleaned }, { onSuccess: onClose });
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-6 p-6 max-h-[80vh] overflow-y-auto"
		>
			<div>
				<p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground pb-2 border-b mb-4">
					<Wallet className="h-3.5 w-3.5" />
					Customer & Payment
				</p>
				<div className="grid grid-cols-2 gap-4">
					<Field>
						<FieldLabel>Customer</FieldLabel>
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
						<FieldLabel>Customer Number</FieldLabel>
						<Input {...register("customerNumber")} />
					</Field>
					<Field className="col-span-2">
						<FieldLabel>Payment Method</FieldLabel>
						<select
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
									<FieldLabel className="text-xs">
										{PAYMENT_METHOD_LABELS[hybridParts[0]]} Transaction ID
									</FieldLabel>
									<Input
										placeholder="TXN ID (optional)"
										{...register("payments.0.transactionId")}
									/>
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
									<FieldLabel className="text-xs">
										{PAYMENT_METHOD_LABELS[hybridParts[1]]} Transaction ID
									</FieldLabel>
									<Input
										placeholder="TXN ID (optional)"
										{...register("payments.1.transactionId")}
									/>
								</Field>
							)}
						</div>
					)}

					{singleTransactional && (
						<div className="col-span-2 rounded-md border bg-muted/30 p-4">
							<Field>
								<FieldLabel className="text-xs">Transaction ID</FieldLabel>
								<Input
									placeholder="TXN ID (optional)"
									{...register("payments.0.transactionId")}
								/>
							</Field>
						</div>
					)}
				</div>
			</div>

			{showItemsCard && (
				<div>
					<div className="flex items-center justify-between pb-2 border-b mb-4">
						<p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
							{showPrepared && !showItems ? (
								<ChefHat className="h-3.5 w-3.5" />
							) : (
								<Receipt className="h-3.5 w-3.5" />
							)}
							{itemsCardTitle}
						</p>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() =>
								appendItem({
									itemType: "PRODUCT",
									productId: "",
									preparedProductId: "",
									unitId: "",
									quantity: 1,
									sellPrice: 0,
									discount: 0,
								})
							}
						>
							<Plus className="h-3 w-3 mr-1" /> Add Item
						</Button>
					</div>
					<div className="space-y-2">
						{itemFields.map((field, index) => (
							<div
								key={field.id}
								className="grid grid-cols-12 gap-2 items-end p-3 border rounded-md"
							>
								<div className="col-span-4">
									<FieldLabel className="text-xs">Item</FieldLabel>
									<SearchableCombobox
										value={getSelectedItemValue(index)}
										onChange={(value) => handleItemSelect(index, value)}
										options={itemOptions.map((o) => ({
											value: o.value,
											label: o.label,
											description: o.description,
											searchValue: o.searchValue,
										}))}
										placeholder="Select item..."
										searchPlaceholder="Search products or menu items..."
										emptyText="Nothing found."
										clearLabel="No item"
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
										onClick={() => removeItem(index)}
										aria-label="Remove item"
									>
										<Trash2 className="h-4 w-4 text-destructive" />
									</Button>
								</div>
							</div>
						))}
						{itemFields.length === 0 && (
							<div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
								No {itemsCardTitle.toLowerCase()} on this sale.
							</div>
						)}
					</div>
				</div>
			)}

			{showServices && (
				<div>
					<div className="flex items-center justify-between pb-2 border-b mb-4">
						<p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
							<Receipt className="h-3.5 w-3.5" />
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
									{errors.saleServices?.[index]?.serviceId && (
										<FieldError>
											{errors.saleServices[index]?.serviceId?.message}
										</FieldError>
									)}
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
										onClick={() => removeService(index)}
										aria-label="Remove service"
									>
										<Trash2 className="h-4 w-4 text-destructive" />
									</Button>
								</div>
							</div>
						))}
						{serviceFields.length === 0 && (
							<div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
								No services on this sale.
							</div>
						)}
					</div>
				</div>
			)}

			<div className="border rounded-md p-4 space-y-3 bg-muted/30">
				<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pb-2 border-b">
					Summary
				</p>
				{showItemsCard && (
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">
							{itemsCardTitle} Subtotal
						</span>
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

			<div className="flex justify-end gap-3 pt-4 border-t">
				<Button type="button" variant="ghost" onClick={onClose}>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? "Saving..." : "Save Changes"}
				</Button>
			</div>
		</form>
	);
}
