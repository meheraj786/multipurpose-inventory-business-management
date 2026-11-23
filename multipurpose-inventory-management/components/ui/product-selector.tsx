"use client";

import { BarcodeScanner } from "@/components/ui/barcode-scanner";
import {
	type ComboboxOption,
	SearchableCombobox,
} from "@/components/ui/searchable-combobox";
import type { Product } from "@/lib/api/services/product.service";

type Props = {
	options: ComboboxOption[];
	value?: string | null;
	onChange: (value: string) => void;
	onBarcodeProduct?: (product: Product) => void;
	showBarcodeScanner?: boolean;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	clearLabel?: string;
	className?: string;
};

export function ProductSelector({
	options,
	value,
	onChange,
	onBarcodeProduct,
	showBarcodeScanner = true,
	placeholder = "Select product...",
	searchPlaceholder = "Search by name, SKU, or barcode...",
	emptyText = "No product found.",
	clearLabel,
	className,
}: Props) {
	return (
		<div className="space-y-2">
			<SearchableCombobox
				value={value}
				onChange={onChange}
				options={options}
				placeholder={placeholder}
				searchPlaceholder={searchPlaceholder}
				emptyText={emptyText}
				clearLabel={clearLabel}
				className={className}
			/>
			{showBarcodeScanner && (
				<BarcodeScanner
					onProduct={(product) => {
						if (onBarcodeProduct) onBarcodeProduct(product);
						else onChange(product.id);
					}}
				/>
			)}
		</div>
	);
}
