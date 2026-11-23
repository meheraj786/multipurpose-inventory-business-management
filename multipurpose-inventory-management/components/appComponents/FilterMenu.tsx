"use client";

import { ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterOption {
	label: string;
	value: string;
}

interface FilterMenuProps {
	title?: string;
	filterKey: string;
	options: FilterOption[];
}

export function FilterMenu({ title = "Filters", options }: FilterMenuProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className="flex items-center gap-2 rounded-lg bg-white hover:bg-slate-800 hover:text-white"
				>
					<ListFilter className="size-4" />
					<span className="text-sm font-medium">{title}</span>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="start" className="w-48">
				<DropdownMenuSeparator />

				{options.map((option) => (
					<DropdownMenuCheckboxItem key={option.value}>
						{option.label}
					</DropdownMenuCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
