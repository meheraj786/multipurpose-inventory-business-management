"use client";

import { AlertTriangle, Layers, RotateCcw } from "lucide-react";
import { useMemo } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useCurrency } from "@/hooks/useCurrency";
import { useCreateCustomerReturn } from "@/hooks/useCustomerReturn";
import type { Sale } from "@/hooks/useSale";
import type { CreateCustomerReturnInput } from "@/validation/customerReturn.service";

type Props = {
	sale: Sale;
	onClose: () => void;
};

interface FormReturnItem {
	selected: boolean;
	itemType: "PRODUCT" | "PREPARED_PRODUCT";
	productId?: string;
	preparedProductId?: string;
	name: string;
	quantity: number;
	maxQty: number;
	alreadyReturned: number;
	unitPrice: number;
}

const itemKey = (
	itemType: "PRODUCT" | "PREPARED_PRODUCT",
	productId?: string | null,
	preparedProductId?: string | null,
) =>
	itemType === "PRODUCT"
		? `PRODUCT:${productId}`
		: `PREPARED_PRODUCT:${preparedProductId}`;

export function ReturnItemsModal({ sale, onClose }: Props) {
	const { symbol } = useCurrency();
	const createReturnMutation = useCreateCustomerReturn();

	const alreadyReturnedMap = useMemo(() => {
		const map = new Map<string, number>();
		for (const ret of sale.customerReturns ?? []) {
			const key = itemKey(
				ret.itemType as "PRODUCT" | "PREPARED_PRODUCT",
				ret.productId,
				ret.preparedProductId,
			);
			map.set(key, (map.get(key) ?? 0) + Number(ret.quantity));
		}
		return map;
	}, [sale.customerReturns]);

	const initialItems = useMemo((): FormReturnItem[] => {
		return sale.saleItems.map((item) => {
			const key = itemKey(
				item.itemType as "PRODUCT" | "PREPARED_PRODUCT",
				item.productId,
				item.preparedProductId,
			);
			const alreadyReturned = alreadyReturnedMap.get(key) ?? 0;
			const maxQty = Math.max(0, Number(item.quantity) - alreadyReturned);

			return {
				selected: false,
				itemType: item.itemType as "PRODUCT" | "PREPARED_PRODUCT",
				productId: item.productId || undefined,
				preparedProductId: item.preparedProductId || undefined,
				name: item.product?.name ?? item.preparedProduct?.name ?? "Item",
				quantity: maxQty > 0 ? 1 : 0,
				maxQty,
				alreadyReturned,
				unitPrice: Number(item.sellPrice),
			};
		});
	}, [sale, alreadyReturnedMap]);

	const { handleSubmit, control } = useForm<{
		saleId: string;
		items: FormReturnItem[];
		restocked: boolean;
		reason: string;
	}>({
		defaultValues: {
			saleId: sale.id,
			items: initialItems,
			restocked: true,
			reason: "",
		},
	});

	const { fields } = useFieldArray({
		control,
		name: "items",
	});

	const watchedItems = useWatch({ control, name: "items" }) || [];

	const totalRefundValue = useMemo(() => {
		return watchedItems.reduce((sum, item) => {
			if (!item.selected) return sum;
			const qty = Number(item.quantity) || 0;
			return sum + qty * item.unitPrice;
		}, 0);
	}, [watchedItems]);

	const currentDue = Number(sale.due ?? 0);
	const excessRefund = Math.max(
		0,
		Number((totalRefundValue - currentDue).toFixed(2)),
	);

	const onSubmit = (values: {
		saleId: string;
		items: FormReturnItem[];
		restocked: boolean;
		reason: string;
	}) => {
		const selectedItems = values.items.filter((item) => item.selected);
		if (selectedItems.length === 0) {
			toast.error("Please select at least one item line to return");
			return;
		}

		for (const item of selectedItems) {
			const qty = Number(item.quantity) || 0;
			if (qty <= 0) {
				toast.error(`Enter a quantity greater than 0 for ${item.name}`);
				return;
			}
			if (qty > item.maxQty) {
				toast.error(
					`Cannot return ${qty} of ${item.name} — only ${item.maxQty} unit(s) remain returnable`,
				);
				return;
			}
		}

		const payload: CreateCustomerReturnInput = {
			saleId: values.saleId,
			restocked: values.restocked,
			reason: values.reason,
			items: selectedItems.map((item) => ({
				itemType: item.itemType,
				productId: item.productId,
				preparedProductId: item.preparedProductId,
				quantity: item.quantity,
			})),
		};

		createReturnMutation.mutate(payload, {
			onSuccess: (result) => {
				if (result?.requiresManualRefund) {
					toast.success(
						`Return processed. ${symbol}${Number(result.excessAmount ?? 0).toFixed(2)} exceeds the outstanding due and needs manual refund handling.`,
					);
				} else {
					toast.success("Customer return processed successfully");
				}
				onClose();
			},
			onError: (err) => {
				toast.error(err.message || "Failed to process customer return");
			},
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
			<div className="space-y-2">
				<Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Purchased Items List
				</Label>
				<div className="border rounded-lg overflow-hidden">
					<Table>
						<TableHeader className="bg-muted/40">
							<TableRow>
								<TableHead className="w-[50px]"></TableHead>
								<TableHead>Description</TableHead>
								<TableHead className="text-right">Unit Price</TableHead>
								<TableHead className="text-center w-[120px]">
									Qty to Return
								</TableHead>
								<TableHead className="text-right">Line Total</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{fields.map((field, index) => {
								const isSelected = watchedItems[index]?.selected;
								const unitPrice = watchedItems[index]?.unitPrice || 0;
								const currentQty = Number(watchedItems[index]?.quantity) || 0;
								const maxQty = watchedItems[index]?.maxQty ?? 0;
								const alreadyReturned =
									watchedItems[index]?.alreadyReturned ?? 0;
								const isPrepared =
									watchedItems[index]?.itemType === "PREPARED_PRODUCT";
								const fullyReturned = maxQty <= 0;

								return (
									<TableRow
										key={field.id}
										className={
											isSelected
												? "bg-primary/5"
												: fullyReturned
													? "opacity-50"
													: ""
										}
									>
										<TableCell className="text-center">
											<Controller
												name={`items.${index}.selected`}
												control={control}
												render={({ field }) => (
													<Checkbox
														checked={field.value}
														disabled={fullyReturned}
														onCheckedChange={(checked) =>
															field.onChange(!!checked)
														}
													/>
												)}
											/>
										</TableCell>
										<TableCell>
											<div className="flex flex-col">
												<span className="font-semibold text-sm">
													{watchedItems[index]?.name}
												</span>
												<div className="mt-0.5 flex items-center gap-1">
													{isPrepared ? (
														<Badge className="h-4 px-1 text-[8px] bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200 uppercase font-mono">
															<Layers className="h-2 w-2 mr-0.5" /> Prepared
														</Badge>
													) : (
														<Badge
															variant="outline"
															className="h-4 px-1 text-[8px] uppercase font-mono text-muted-foreground"
														>
															Standard
														</Badge>
													)}
													{fullyReturned && (
														<Badge
															variant="outline"
															className="h-4 px-1 text-[8px] uppercase font-mono border-destructive/40 text-destructive"
														>
															Fully returned
														</Badge>
													)}
												</div>
											</div>
										</TableCell>
										<TableCell className="text-right font-mono font-medium">
											{symbol}
											{unitPrice.toFixed(2)}
										</TableCell>
										<TableCell className="text-center">
											<Controller
												name={`items.${index}.quantity`}
												control={control}
												render={({ field }) => (
													<Input
														type="number"
														min={1}
														max={maxQty}
														disabled={!isSelected || fullyReturned}
														value={field.value}
														onChange={(e) =>
															field.onChange(Number(e.target.value))
														}
														className="h-8 text-center font-mono w-20 mx-auto"
													/>
												)}
											/>
											<span className="text-[9px] text-muted-foreground block mt-1">
												{alreadyReturned > 0
													? `Returnable: ${maxQty} (already returned: ${alreadyReturned})`
													: `Max purchased: ${maxQty}`}
											</span>
										</TableCell>
										<TableCell className="text-right font-mono font-bold">
											{symbol}
											{(isSelected ? currentQty * unitPrice : 0).toFixed(2)}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			</div>

			<div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-neutral-50/50 dark:bg-neutral-900/30">
				<div className="space-y-0.5">
					<Label className="text-sm font-semibold">Restock Items</Label>
					<p className="text-[10px] text-muted-foreground">
						Return these items directly back to active system stock.
					</p>
				</div>
				<Controller
					name="restocked"
					control={control}
					render={({ field }) => (
						<Switch checked={field.value} onCheckedChange={field.onChange} />
					)}
				/>
			</div>

			<div className="space-y-1.5">
				<Label htmlFor="reason">Reason for Return</Label>
				<Controller
					name="reason"
					control={control}
					render={({ field }) => (
						<Input
							id="reason"
							placeholder="e.g. Defective item, customer changed mind"
							value={field.value}
							onChange={field.onChange}
						/>
					)}
				/>
			</div>

			{currentDue > 0 && totalRefundValue > 0 && (
				<div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg">
					<AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
					<div className="text-xs text-amber-800 dark:text-amber-400 space-y-1">
						<p className="font-semibold">Outstanding Due Balance Detected</p>
						<p>
							Applying a refund of {symbol}
							{totalRefundValue.toFixed(2)} will reduce the customer&apos;s
							outstanding due balance first. Remaining due will drop from{" "}
							{symbol}
							{currentDue.toFixed(2)} to {symbol}
							{Math.max(0, currentDue - totalRefundValue).toFixed(2)}.
						</p>
					</div>
				</div>
			)}

			{excessRefund > 0 && (
				<div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg">
					<AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-500 mt-0.5 shrink-0" />
					<div className="text-xs text-red-800 dark:text-red-400 space-y-1">
						<p className="font-semibold">Refund Exceeds Due Balance</p>
						<p>
							{symbol}
							{excessRefund.toFixed(2)} of this refund exceeds the sale&apos;s
							outstanding due and will be flagged on the return record for
							manual refund handling — it will not automatically credit or pay
							out to the customer.
						</p>
					</div>
				</div>
			)}

			<div className="flex items-center justify-between pt-4 border-t">
				<div>
					<p className="text-xs text-muted-foreground uppercase tracking-wider">
						Total Refund Value
					</p>
					<p className="text-xl font-extrabold font-mono text-red-600">
						{symbol}
						{totalRefundValue.toFixed(2)}
					</p>
				</div>
				<div className="flex gap-3">
					<Button
						type="button"
						variant="ghost"
						onClick={onClose}
						disabled={createReturnMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={createReturnMutation.isPending || totalRefundValue <= 0}
						className="gap-2"
					>
						<RotateCcw className="h-4 w-4" />
						{createReturnMutation.isPending
							? "Processing..."
							: "Confirm Return"}
					</Button>
				</div>
			</div>
		</form>
	);
}
