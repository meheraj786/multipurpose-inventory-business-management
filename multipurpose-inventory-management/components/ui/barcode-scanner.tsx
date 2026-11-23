"use client";

import { Barcode } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	type Product,
	ProductApiService,
} from "@/lib/api/services/product.service";

type Props = {
	onProduct: (product: Product) => void;
	autoFocus?: boolean;
	placeholder?: string;
};

export function BarcodeScanner({
	onProduct,
	autoFocus = false,
	placeholder = "Scan barcode",
}: Props) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [barcode, setBarcode] = useState("");
	const [isLookingUp, setIsLookingUp] = useState(false);
	const [scanError, setScanError] = useState("");

	useEffect(() => {
		if (autoFocus && !isLookingUp) inputRef.current?.focus();
	}, [autoFocus, isLookingUp]);

	const handleScan = async () => {
		const code = barcode.trim();
		if (!code || isLookingUp) return;

		setIsLookingUp(true);
		setScanError("");
		try {
			const product = await ProductApiService.findByBarcode(code);
			if (!product) {
				setScanError("No product found for this barcode.");
				return;
			}
			onProduct(product);
			setBarcode("");
		} catch (error) {
			setScanError(
				error instanceof Error
					? error.message
					: "Could not look up this barcode. Please try again.",
			);
		} finally {
			setIsLookingUp(false);
		}
	};

	return (
		<Field>
			<div className="relative">
				<Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					ref={inputRef}
					value={barcode}
					onChange={(event) => {
						setBarcode(event.target.value);
						if (scanError) setScanError("");
					}}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							void handleScan();
						}
					}}
					placeholder={isLookingUp ? "Looking up barcode..." : placeholder}
					aria-label="Scan product barcode"
					autoComplete="off"
					className="pl-9"
					disabled={isLookingUp}
				/>
			</div>
			{scanError && <FieldError>{scanError}</FieldError>}
		</Field>
	);
}
