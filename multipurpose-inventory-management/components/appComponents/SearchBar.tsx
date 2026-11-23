// components/SearchBar.tsx
"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
	placeholder?: string;
}

export function SearchBar({ placeholder = "Search..." }: SearchBarProps) {
	return (
		<div className="relative w-full max-w-[448px]">
			<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="search"
				placeholder={placeholder}
				className="w-full h-10 pl-9"
			/>
		</div>
	);
}
