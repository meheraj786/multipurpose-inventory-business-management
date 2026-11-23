"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	ArrowLeft,
	BadgePercent,
	ChefHat,
	CreditCard,
	DollarSign,
	Layers,
	Package,
	PiggyBank,
	Plus,
	Receipt,
	Smartphone,
	Trash2,
	User,
	UserPlus,
	Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import DataTable, { type PaginationParams } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/hooks/useCurrency";
import { useCreateCustomer, useGetCustomers } from "@/hooks/useCustomer";
import { useGetPreparedProducts } from "@/hooks/usePreparedProducts";
import { useGetProducts } from "@/hooks/useProducts";
import {
	type Sale,
	type SaleInvoice,
	useCreateSale,
	useGetSales,
} from "@/hooks/useSale";
import { useGetServices } from "@/hooks/useService";
import { type Unit, useGetUnits } from "@/hooks/useUnits";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { cn } from "@/lib/utils";
import {
	type CreateSaleForm,
	createSaleSchema,
	HYBRID_PARTS,
	isHybrid,
	modelHasItems,
	modelHasPreparedProducts,
	modelHasServices,
	PAYMENT_METHOD_LABELS,
	PAYMENT_METHODS,
	type PaymentMethod,
} from "@/validation/sale.schema";
import { getSaleColumns } from "../columns";

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

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
	CASH: <Wallet className="h-4 w-4" />,
	CARD: <CreditCard className="h-4 w-4" />,
	MOBILE_BANKING: <Smartphone className="h-4 w-4" />,
	CREDIT: <PiggyBank className="h-4 w-4" />,
};

export default function CreateSalePage() {
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);
	const [_editTarget, setEditTarget] = useState<Sale | null>(null);
	const [_deleteTarget, setDeleteTarget] = useState<Sale | null>(null);
	const [_dueTarget, setDueTarget] = useState<Sale | null>(null);
	const [_viewInvoice, setViewInvoice] = useState<SaleInvoice | null>(null);
	const model = useAuthStore((s) => s.user?.account.model) ?? "SERVICE";
	const { symbol } = useCurrency();
	const [tableParams, setTableParams] = useState<PaginationParams>({
		page: 1,
		pageSize: 10,
	});

	const { data: result, isLoading } = useGetSales(tableParams);
	const sales = result?.data ?? [];
	const totalCount = result?.meta.total ?? 0;
	const columns = useMemo(
		() =>
			getSaleColumns(
				{
					onEdit: (sale) => setEditTarget(sale),
					onDelete: (sale) => setDeleteTarget(sale),
					onCollectDue: (sale) => setDueTarget(sale),
					onViewInvoice: (invoice) => setViewInvoice(invoice),
				},
				symbol,
			),
		[symbol],
	);

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
			description: `Product · ${symbol}${Number(product.defaultSalePrice ?? 0).toFixed(2)} · ${product.totalStock ?? 0} in stock`,
			searchValue: `${product.name} ${product.sku ?? ""}`,
			stock: product.totalStock ?? 0,
			unitId: product.unitId ?? "",
			sellPrice: Number(product.defaultSalePrice ?? 0),
		})),
		...preparedProducts.map((pp) => ({
			value: `prepared:${pp.id}`,
			itemType: "PREPARED_PRODUCT" as const,
			id: pp.id,
			label: pp.name,
			description: `Menu Item · ${symbol}${Number(pp.defaultSalePrice ?? 0).toFixed(2)} · ${pp.totalStock ?? 0} in stock`,
			searchValue: pp.name,
			stock: pp.totalStock ?? 0,
			unitId: pp.unitId ?? "",
			sellPrice: Number(pp.defaultSalePrice ?? 0),
		})),
	];

	const itemsCardTitle =
		showItems && showPrepared
			? "Inventory & Menu Items"
			: showPrepared
				? "Prepared Menu Items"
				: "Inventory Products";

	const { mutate: createSale, isPending } = useCreateSale();
	const { mutate: createCustomer, isPending: isCreatingCustomer } =
		useCreateCustomer();

	const [isNewCustomerMode, setIsNewCustomerMode] = useState(false);
	const [newCustomerName, setNewCustomerName] = useState("");
	const [newCustomerPhone, setNewCustomerPhone] = useState("");

	const {
		register,
		handleSubmit,
		control,
		setValue,
		trigger,
		reset,
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

	const activeCustomerDetail = useMemo(() => {
		return customers.find((c) => c.id === selectedCustomerId);
	}, [customers, selectedCustomerId]);

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

	const subtotal = itemsTotal + servicesTotal;
	const grandTotal = Math.max(0, subtotal - Number(watchedDiscount));

	const needsTransactionId = (method: string) =>
		["CARD", "MOBILE_BANKING", "CREDIT"].includes(method);

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

	const singleTransactional = !hybrid && needsTransactionId(selectedMethod);

	const handleItemSelect = (index: number, value: string) => {
		const option = itemOptions.find((o) => o.value === value);
		if (!option) return;

		setValue(`saleItems.${index}.itemType`, option.itemType, {
			shouldValidate: false,
		});
		setValue(
			`saleItems.${index}.productId`,
			option.itemType === "PRODUCT" ? option.id : "",
			{ shouldValidate: false },
		);
		setValue(
			`saleItems.${index}.preparedProductId`,
			option.itemType === "PREPARED_PRODUCT" ? option.id : "",
			{ shouldValidate: false },
		);
		setValue(`saleItems.${index}.unitId`, option.unitId, {
			shouldValidate: false,
		});
		setValue(`saleItems.${index}.sellPrice`, option.sellPrice, {
			shouldValidate: false,
		});

		trigger(`saleItems.${index}.productId`);
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

	const isMac = useMemo(() => {
		if (typeof window === "undefined") return false;
		return /Mac/i.test(window.navigator.userAgent);
	}, []);

	const goBack = useCallback(() => router.back(), [router]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			const isInput =
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.tagName === "SELECT" ||
				target.isContentEditable;

			if (e.key === "Escape" && !isInput) {
				e.preventDefault();
				goBack();
			}

			if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				formRef.current?.requestSubmit();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [goBack]);

	const handleCreateCustomer = () => {
		if (!newCustomerPhone.trim()) return;
		createCustomer(
			{
				name: newCustomerName.trim() || "Random Customer",
				phone: newCustomerPhone.trim(),
				hasMembership: false,
			},
			{
				onSuccess: (created) => {
					setValue("customerId", created.id, {
						shouldDirty: true,
						shouldValidate: true,
					});
					setIsNewCustomerMode(false);
					setNewCustomerName("");
					setNewCustomerPhone("");
				},
			},
		);
	};

	const onSubmit = (values: CreateSaleForm) => {
		const collectedNow = Math.max(0, grandTotal - Number(values.due ?? 0));
		const payments = singleTransactional
			? [
					{
						method: values.paymentMethod,
						amount: collectedNow,
						transactionId: values.payments?.[0]?.transactionId ?? "",
					},
				]
			: values.payments;

		const cleaned: CreateSaleForm = {
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
		createSale(cleaned, {
			onSuccess: () => {
				reset();
			},
		});
	};

	const customerOptions = [
		...customers.map((customer) => ({
			value: customer.id,
			label: customer.name,
			description: customer.phone,
			searchValue: `${customer.name} ${customer.phone ?? ""}`,
		})),
		{
			value: "__new__",
			label: "➕ Register New Profile",
			description: "Add customer profile inline",
			searchValue: "new customer register",
		},
	];

	return (
		<div className="min-h-screen bg-muted/25">
			<div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
				<div className="mx-auto flex w-full  items-center justify-between gap-4 px-4 py-4 sm:px-6">
					<div className="flex items-center gap-3">
						<Button
							type="button"
							variant="outline"
							size="icon"
							onClick={goBack}
							aria-label="Go back"
							className="h-9 w-9 rounded-full"
						>
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<div>
							<h1 className="text-xl font-bold tracking-tight">
								Create Transaction
							</h1>
							<p className="hidden text-xs text-muted-foreground sm:block mt-0.5">
								Record sales, adjust inline prices, process customer payments,
								and view logs.
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={goBack}
							className="h-9 text-xs"
						>
							Cancel
							<span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
								Esc
							</span>
						</Button>
						<Button
							type="submit"
							form="create-sale-form"
							disabled={isPending}
							size="sm"
							className="h-9 text-xs font-semibold px-4"
						>
							{isPending ? "Processing..." : "Create Sale"}
							<span className="ml-1.5 hidden sm:inline rounded bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground/90">
								{isMac ? "⌘+Enter" : "Ctrl+Enter"}
							</span>
						</Button>
					</div>
				</div>
			</div>

			<form
				ref={formRef}
				id="create-sale-form"
				onSubmit={handleSubmit(onSubmit)}
				className="mx-auto w-full px-4 py-6 sm:px-6"
			>
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
					<div className="space-y-6">
						<Card className="border shadow-sm">
							<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
								<div className="p-1.5 bg-primary/10 rounded-lg text-primary">
									<User className="h-4 w-4" />
								</div>
								<CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground/80">
									Customer Placement
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
									<div className="sm:col-span-12">
										<FieldLabel
											htmlFor="customerId"
											className="text-xs font-semibold text-muted-foreground"
										>
											Select Recipient Profile
										</FieldLabel>
										<div className="mt-1">
											<SearchableCombobox
												value={selectedCustomerId}
												onChange={(value) => {
													if (value === "__new__") {
														setIsNewCustomerMode(true);
														setValue("customerId", "", {
															shouldDirty: true,
															shouldValidate: true,
														});
													} else {
														setIsNewCustomerMode(false);
														setValue("customerId", value, {
															shouldDirty: true,
															shouldValidate: true,
														});
													}
												}}
												options={customerOptions}
												placeholder="Walk-in Customer"
												searchPlaceholder="Search customer directories..."
												emptyText="No customer matching parameters found."
												clearLabel="Default Walk-in Recipient"
											/>
										</div>
										{activeCustomerDetail && (
											<div className="mt-2.5 flex items-center gap-2">
												{activeCustomerDetail.hasMembership ? (
													<Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-indigo-200 text-[10px] font-semibold h-5 px-2">
														Premium Member
													</Badge>
												) : (
													<Badge
														variant="outline"
														className="text-[10px] h-5 px-2 text-muted-foreground"
													>
														Regular Profile Account
													</Badge>
												)}
												<span className="text-xs text-muted-foreground font-mono">
													Phone: {activeCustomerDetail.phone}
												</span>
											</div>
										)}
									</div>
								</div>

								{isNewCustomerMode && (
									<div className="space-y-4 rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 p-4 mt-2">
										<div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
											<UserPlus className="h-3.5 w-3.5" /> Inline Registration
											Details
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
											<Field>
												<FieldLabel className="text-[10px] font-bold uppercase">
													Customer Name
												</FieldLabel>
												<Input
													value={newCustomerName}
													onChange={(e) => setNewCustomerName(e.target.value)}
													placeholder="Optional description"
													className="h-9 mt-1 bg-background"
												/>
											</Field>
											<Field>
												<FieldLabel className="text-[10px] font-bold uppercase">
													Phone Number *
												</FieldLabel>
												<Input
													value={newCustomerPhone}
													onChange={(e) => setNewCustomerPhone(e.target.value)}
													placeholder="Required contact number"
													className="h-9 mt-1 bg-background"
												/>
											</Field>
										</div>
										<div className="flex items-center gap-2 pt-2">
											<Button
												type="button"
												size="sm"
												onClick={handleCreateCustomer}
												disabled={
													isCreatingCustomer || !newCustomerPhone.trim()
												}
												className="h-8 text-xs px-3"
											>
												{isCreatingCustomer
													? "Registering..."
													: "Add to Registry"}
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => {
													setIsNewCustomerMode(false);
													setNewCustomerName("");
													setNewCustomerPhone("");
												}}
												className="h-8 text-xs hover:bg-background"
											>
												Cancel
											</Button>
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{showItemsCard && (
							<Card className="border shadow-sm">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
									<div className="flex items-center gap-2">
										<div className="p-1.5 bg-primary/10 rounded-lg text-primary">
											{showPrepared && !showItems ? (
												<ChefHat className="h-4 w-4" />
											) : (
												<Package className="h-4 w-4" />
											)}
										</div>
										<CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground/80">
											{itemsCardTitle}
										</CardTitle>
									</div>
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
										className="h-8 text-xs font-semibold gap-1"
									>
										<Plus className="h-3.5 w-3.5" /> Append Row
									</Button>
								</CardHeader>
								<CardContent>
									{itemFields.length === 0 ? (
										<EmptyRow
											label={`No ${itemsCardTitle.toLowerCase()} selected yet. Click append row to add.`}
										/>
									) : (
										<div className="space-y-3">
											{itemFields.map((field, index) => (
												<div
													key={field.id}
													className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/10 p-3 sm:grid-cols-12 sm:items-end sm:gap-2.5 relative group"
												>
													<div className="col-span-2 sm:col-span-4">
														<FieldLabel className="text-[10px] font-bold uppercase tracking-wider">
															Item Name
														</FieldLabel>
														<div className="mt-1">
															<SearchableCombobox
																value={getSelectedItemValue(index)}
																onChange={(value) =>
																	handleItemSelect(index, value)
																}
																options={itemOptions.map((o) => ({
																	value: o.value,
																	label: o.label,
																	description: o.description,
																	searchValue: o.searchValue,
																}))}
																placeholder="Select item..."
																searchPlaceholder="Search catalog records..."
																emptyText="Item query returned empty."
																clearLabel="Deselect item"
																className="h-9"
															/>
														</div>
														{errors.saleItems?.[index]?.productId && (
															<FieldError>
																{errors.saleItems[index]?.productId?.message}
															</FieldError>
														)}
													</div>

													<div className="sm:col-span-2">
														<FieldLabel className="text-[10px] font-bold uppercase tracking-wider">
															Unit
														</FieldLabel>
														<div className="mt-1">
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
																searchPlaceholder="Search measures..."
																emptyText="Unit empty."
																clearLabel="Deselect unit"
																className="h-9"
															/>
														</div>
													</div>

													<div className="sm:col-span-2">
														<FieldLabel className="text-[10px] font-bold uppercase tracking-wider">
															Qty
														</FieldLabel>
														<Input
															type="number"
															step="0.0001"
															className="h-9 mt-1 bg-background text-right font-mono"
															{...register(`saleItems.${index}.quantity`, {
																valueAsNumber: true,
															})}
														/>
													</div>

													<div className="sm:col-span-2">
														<FieldLabel className="text-[10px] font-bold uppercase tracking-wider">
															Price
														</FieldLabel>
														<Input
															type="number"
															step="0.01"
															className="h-9 mt-1 bg-background text-right font-mono"
															{...register(`saleItems.${index}.sellPrice`, {
																valueAsNumber: true,
															})}
														/>
													</div>

													<div className="sm:col-span-1">
														<FieldLabel className="text-[10px] font-bold uppercase tracking-wider">
															Disc.
														</FieldLabel>
														<Input
															type="number"
															step="0.01"
															className="h-9 mt-1 bg-background text-right font-mono text-destructive"
															placeholder="0.00"
															{...register(`saleItems.${index}.discount`, {
																valueAsNumber: true,
															})}
														/>
													</div>

													<div className="flex justify-end pb-0.5 sm:col-span-1">
														<Button
															type="button"
															variant="ghost"
															size="icon"
															onClick={() => removeItem(index)}
															aria-label="Remove item"
															className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-md"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						)}

						{showServices && (
							<Card className="border shadow-sm">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
									<div className="flex items-center gap-2">
										<div className="p-1.5 bg-primary/10 rounded-lg text-primary">
											<Layers className="h-4 w-4" />
										</div>
										<CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground/80">
											Services List
										</CardTitle>
									</div>
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
										className="h-8 text-xs font-semibold gap-1"
									>
										<Plus className="h-3.5 w-3.5" /> Append Row
									</Button>
								</CardHeader>
								<CardContent>
									{serviceFields.length === 0 ? (
										<EmptyRow label="No service records selected yet. Click append row to add." />
									) : (
										<div className="space-y-3">
											{serviceFields.map((field, index) => (
												<div
													key={field.id}
													className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/10 p-3 sm:grid-cols-12 sm:items-end sm:gap-2.5 relative group"
												>
													<div className="col-span-2 sm:col-span-5">
														<FieldLabel className="text-[10px] font-bold uppercase tracking-wider">
															Service Title
														</FieldLabel>
														<div className="mt-1">
															<SearchableCombobox
																value={watchedServices[index]?.serviceId ?? ""}
																onChange={(value) => {
																	const svc = services.find(
																		(s) => s.id === value,
																	);
																	setValue(
																		`saleServices.${index}.serviceId`,
																		value,
																		{ shouldDirty: true, shouldValidate: true },
																	);
																	if (svc) {
																		setValue(
																			`saleServices.${index}.unitPrice`,
																			Number(svc.salePrice ?? 0),
																			{
																				shouldDirty: true,
																				shouldValidate: true,
																			},
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
																searchPlaceholder="Search active services..."
																emptyText="Service match query returned empty."
																clearLabel="Deselect service"
																className="h-9"
															/>
														</div>
													</div>

													<div className="sm:col-span-2">
														<FieldLabel className="text-[10px] font-bold uppercase tracking-wider">
															Qty
														</FieldLabel>
														<Input
															type="number"
															min={1}
															className="h-9 mt-1 bg-background text-right font-mono"
															{...register(`saleServices.${index}.quantity`, {
																valueAsNumber: true,
															})}
														/>
													</div>

													<div className="sm:col-span-2">
														<FieldLabel className="text-[10px] font-bold uppercase tracking-wider">
															Price
														</FieldLabel>
														<Input
															type="number"
															step="0.01"
															className="h-9 mt-1 bg-background text-right font-mono"
															{...register(`saleServices.${index}.unitPrice`, {
																valueAsNumber: true,
															})}
														/>
													</div>

													<div className="sm:col-span-2">
														<FieldLabel className="text-[10px] font-bold uppercase tracking-wider">
															Discount
														</FieldLabel>
														<Input
															type="number"
															step="0.01"
															className="h-9 mt-1 bg-background text-right font-mono text-destructive"
															{...register(`saleServices.${index}.discount`, {
																valueAsNumber: true,
															})}
														/>
													</div>

													<div className="flex justify-end pb-0.5 sm:col-span-1">
														<Button
															type="button"
															variant="ghost"
															size="icon"
															onClick={() => removeService(index)}
															aria-label="Remove service"
															className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-md"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						)}

						<Card className="border shadow-sm">
							<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
								<div className="p-1.5 bg-primary/10 rounded-lg text-primary">
									<Wallet className="h-4 w-4" />
								</div>
								<CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground/80">
									Payment Method Allocation
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<FieldLabel className="text-xs font-semibold text-muted-foreground">
										Select Transaction Channel
									</FieldLabel>
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
										{PAYMENT_METHODS.map((method) => {
											const active = selectedMethod === method;
											return (
												<Button
													key={method}
													type="button"
													variant={active ? "default" : "outline"}
													className={cn(
														"h-12 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold tracking-wide rounded-lg transition-all border",
														active
															? "bg-primary border-primary shadow-sm text-primary-foreground scale-[1.02]"
															: "bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground border-border",
													)}
													onClick={() => handleMethodChange(method)}
												>
													{PAYMENT_ICONS[method] ?? (
														<Receipt className="h-4 w-4" />
													)}
													<span>{PAYMENT_METHOD_LABELS[method]}</span>
												</Button>
											);
										})}
									</div>
								</div>

								{hybrid && hybridParts && (
									<div className="rounded-lg border bg-muted/30 p-4 space-y-3">
										<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
											Hybrid Split Distribution Balance
										</p>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
											<div className="space-y-1.5">
												<FieldLabel className="text-[11px] font-semibold">
													{PAYMENT_METHOD_LABELS[hybridParts[0]]} Amount (
													{symbol})
												</FieldLabel>
												<Input
													type="number"
													step="0.01"
													placeholder="0.00"
													className="h-9"
													{...register("payments.0.amount", {
														valueAsNumber: true,
													})}
												/>
												{needsTransactionId(hybridParts[0]) && (
													<Input
														placeholder="Reference ID"
														className="h-8 mt-1 text-xs"
														{...register("payments.0.transactionId")}
													/>
												)}
											</div>

											<div className="space-y-1.5">
												<FieldLabel className="text-[11px] font-semibold">
													{PAYMENT_METHOD_LABELS[hybridParts[1]]} Amount (
													{symbol})
												</FieldLabel>
												<Input
													type="number"
													step="0.01"
													placeholder="0.00"
													className="h-9"
													{...register("payments.1.amount", {
														valueAsNumber: true,
													})}
												/>
												{needsTransactionId(hybridParts[1]) && (
													<Input
														placeholder="Reference ID"
														className="h-8 mt-1 text-xs"
														{...register("payments.1.transactionId")}
													/>
												)}
											</div>
										</div>
									</div>
								)}

								{singleTransactional && (
									<div className="rounded-lg border bg-muted/30 p-3">
										<Field>
											<FieldLabel className="text-[10px] font-bold uppercase">
												Transaction / Wire ID
											</FieldLabel>
											<Input
												placeholder="Enter reference ID / Bank transaction trace reference"
												className="h-9 mt-1.5"
												{...register("payments.0.transactionId")}
											/>
										</Field>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					<div className="lg:sticky lg:top-24 space-y-6">
						<Card className="border shadow-md overflow-hidden bg-background">
							<div className="p-4 bg-primary/5 border-b flex items-center justify-between">
								<span className="text-xs font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
									<Receipt className="h-4 w-4 text-primary" /> Billing Receipt
								</span>
								<Badge className="bg-primary/15 text-primary font-bold">
									POS ACTIVE
								</Badge>
							</div>
							<CardContent className="space-y-4 pt-4">
								<div className="space-y-2.5">
									{showItemsCard && (
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">
												Items Total Value
											</span>
											<span className="font-mono text-foreground font-semibold">
												{symbol}
												{itemsTotal.toFixed(2)}
											</span>
										</div>
									)}
									{showServices && (
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">
												Services Total Value
											</span>
											<span className="font-mono text-foreground font-semibold">
												{symbol}
												{servicesTotal.toFixed(2)}
											</span>
										</div>
									)}

									<Separator className="my-1 border-dashed" />

									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground flex items-center gap-1.5">
											<BadgePercent className="h-4 w-4 text-destructive" />{" "}
											Overall Discount
										</span>
										<div className="relative">
											<span className="absolute left-2.5 top-1.5 text-xs text-muted-foreground font-semibold">
												{symbol}
											</span>
											<Input
												type="number"
												step="0.01"
												className="h-8 w-24 pl-6 text-right font-mono text-destructive font-semibold"
												{...register("discount", { valueAsNumber: true })}
											/>
										</div>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground flex items-center gap-1.5">
											<DollarSign className="h-4 w-4 text-amber-500" /> Deferred
											Balance Due
										</span>
										<div className="relative">
											<span className="absolute left-2.5 top-1.5 text-xs text-muted-foreground font-semibold">
												{symbol}
											</span>
											<Input
												type="number"
												step="0.01"
												className="h-8 w-24 pl-6 text-right font-mono font-semibold"
												{...register("due", { valueAsNumber: true })}
											/>
										</div>
									</div>

									<Separator className="my-2" />

									<div className="flex justify-between items-center text-foreground font-bold py-1">
										<span className="text-sm font-bold uppercase tracking-wider">
											Final Grand Total
										</span>
										<span className="text-xl font-bold font-mono text-primary">
											{symbol}
											{grandTotal.toFixed(2)}
										</span>
									</div>
								</div>

								<Button
									type="submit"
									className="w-full mt-2 h-11 text-sm font-bold shadow-md transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
									disabled={isPending}
								>
									{isPending ? "Processing..." : "Complete Sale"}
									<span className="ml-1.5 hidden sm:inline rounded bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground/90">
										{isMac ? "⌘+Enter" : "Ctrl+Enter"}
									</span>
								</Button>

								<Button
									type="button"
									variant="ghost"
									className="w-full sm:hidden text-xs text-muted-foreground h-9"
									onClick={goBack}
								>
									Discard Changes
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</form>

			<div className="mx-auto w-full px-4 py-2 sm:px-6 pb-12">
				<Card className="border shadow-sm">
					<CardHeader className="py-4 border-b">
						<CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
							<Receipt className="h-4.5 w-4.5 text-muted-foreground" />{" "}
							Historical Sale Entries
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-4">
						<DataTable
							title="Historical Transactions"
							columns={columns}
							data={sales}
							totalCount={totalCount}
							currentPage={tableParams.page}
							pageSize={tableParams.pageSize}
							onPaginationChange={setTableParams}
							loading={isLoading}
							searchPlaceholder="Filter records by customer name..."
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function EmptyRow({ label }: { label: string }) {
	return (
		<div className="rounded-lg border-2 border-dashed p-10 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
			<Receipt className="h-8 w-8 text-muted-foreground/55 stroke-[1.5]" />
			<p className="font-medium max-w-xs">{label}</p>
		</div>
	);
}
