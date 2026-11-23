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

export type ComboboxOption = {
	value: string;
	label: string;
	description?: string | null;
	searchValue?: string;
};

type SearchableComboboxProps = {
	options: ComboboxOption[];
	value?: string | null;
	onChange: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	clearLabel?: string;
	disabled?: boolean;
	className?: string;
	contentClassName?: string;
};

export function SearchableCombobox({
	options,
	value,
	onChange,
	placeholder = "Select...",
	searchPlaceholder = "Search...",
	emptyText = "No results found.",
	clearLabel,
	disabled = false,
	className,
	contentClassName,
}: SearchableComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const selectedOption = options.find((option) => option.value === value);

	const handleSelect = (nextValue: string) => {
		onChange(nextValue);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={cn(
						"h-10 w-full justify-between px-3 font-normal",
						!selectedOption && "text-muted-foreground",
						className,
					)}
				>
					<span className="min-w-0 flex-1 truncate text-left">
						{selectedOption ? selectedOption.label : placeholder}
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className={cn(
					"w-(--radix-popover-trigger-width) p-0",
					contentClassName,
				)}
			>
				<Command>
					<CommandInput placeholder={searchPlaceholder} />
					<CommandList>
						<CommandEmpty>{emptyText}</CommandEmpty>
						<CommandGroup>
							{clearLabel && (
								<CommandItem
									value={clearLabel}
									onSelect={() => handleSelect("")}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											!value ? "opacity-100" : "opacity-0",
										)}
									/>
									<span>{clearLabel}</span>
								</CommandItem>
							)}
							{options.map((option) => (
								<CommandItem
									key={option.value}
									value={`${option.searchValue ?? option.label} ${option.value}`}
									onSelect={() => handleSelect(option.value)}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === option.value ? "opacity-100" : "opacity-0",
										)}
									/>
									<span className="min-w-0 flex-1">
										<span className="block truncate">{option.label}</span>
										{option.description && (
											<span className="block truncate text-xs text-muted-foreground">
												{option.description}
											</span>
										)}
									</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
