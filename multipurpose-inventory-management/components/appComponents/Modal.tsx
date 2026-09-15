"use client";

import type { ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ModalProps = {
	trigger?: ReactNode;
	title: string;
	description?: string;
	children: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	className?: string;
};

export function Modal({
	trigger,
	title,
	description,
	children,
	open,
	onOpenChange,
	className,
}: ModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

			<DialogContent
				className={cn(
					" w-full max-w-7xl  border-8 p-0 overflow-y-auto",
					className,
				)}
			>
				<DialogHeader className="p-6 pb-0">
					<DialogTitle>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>

				<div className="flex flex-col">{children}</div>
			</DialogContent>
		</Dialog>
	);
}
