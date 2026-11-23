"use client";

import { isAxiosError } from "axios";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

type Props = {
	onScan: (barcode: string) => Promise<void>;
	autoFocus?: boolean;
	placeholder?: string;
};

export function BarcodeScannerInput({
	onScan,
	autoFocus = false,
	placeholder = "Scan barcode and press Enter",
}: Props) {
	const id = useId();
	const [barcode, setBarcode] = useState("");
	const queue = useRef(Promise.resolve());

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter") return;
		event.preventDefault();
		event.stopPropagation();

		const value = barcode.trim();
		if (!value) return;

		setBarcode("");
		queue.current = queue.current
			.then(() => onScan(value))
			.catch((error: unknown) => {
				const message = isAxiosError<{ message?: string }>(error)
					? error.response?.data?.message
					: error instanceof Error
						? error.message
						: undefined;
				toast.error(message || "Could not process this barcode");
			});
	};

	return (
		<div className="space-y-1.5">
			<label
				htmlFor={id}
				className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
			>
				Scan Product Barcode
			</label>
			<Input
				id={id}
				value={barcode}
				onChange={(event) => setBarcode(event.target.value)}
				onKeyDown={handleKeyDown}
				autoFocus={autoFocus}
				autoComplete="off"
				placeholder={placeholder}
			/>
		</div>
	);
}
