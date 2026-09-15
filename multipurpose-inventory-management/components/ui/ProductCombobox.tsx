"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Option = {
	id: string;
	name: string;
	sku?: string | null;
};

interface ProductComboboxProps {
	options: Option[];
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	isLoading?: boolean;
	className?: string;
	disabled?: boolean;
}

export function ProductCombobox({
	options,
	value,
	onChange,
	placeholder = "Select product...",
	searchPlaceholder = "Search product...",
	isLoading = false,
	className,
	disabled = false,
}: ProductComboboxProps) {
	const [open, setOpen] = React.useState(false);

	const selectedOption = options.find((option) => option.id === value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn(
						"w-full justify-between",
						!value && "text-muted-foreground",
						className,
					)}
					disabled={disabled}
				>
					{selectedOption ? (
						<div className="flex flex-col items-start">
							<span>{selectedOption.name}</span>
							{selectedOption.sku && (
								<span className="text-xs text-muted-foreground">
									SKU: {selectedOption.sku}
								</span>
							)}
						</div>
					) : (
						placeholder
					)}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0" align="start">
				<Command>
					<CommandInput placeholder={searchPlaceholder} />
					<CommandList>
						<CommandEmpty>
							{isLoading ? "Loading products..." : "No product found."}
						</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.id}
									value={option.name}
									onSelect={() => {
										onChange(option.id);
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === option.id ? "opacity-100" : "opacity-0",
										)}
									/>
									<div className="flex flex-col">
										<span>{option.name}</span>
										{option.sku && (
											<span className="text-xs text-muted-foreground">
												{option.sku}
											</span>
										)}
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
