"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Filter, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { MetricCard } from "@/components/appComponents/metric-card";
import DataTable, { type PaginationParams } from "@/components/data-table";
// import {
// 	AlertDialog,
// 	AlertDialogAction,
// 	AlertDialogCancel,
// 	AlertDialogContent,
// 	AlertDialogDescription,
// 	AlertDialogFooter,
// 	AlertDialogHeader,
// 	AlertDialogTitle,
// 	AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	useGetTrash,
	usePermanentDelete,
	useRestoreItem,
} from "@/hooks/useTrash";
import type { TrashResponse } from "@/lib/api/services/trashService";

const MODULES = [
	"CATEGORY",
	"SUBCATEGORY",
	"SUPPLIER",
	"PRODUCT",
	"RAW_PRODUCT",
	"PREPARED_PRODUCT",
	"SERVICE",
	"CUSTOMER",
	"SALE",
	"INVOICE",
	"USER",
	"PURCHASE",
	"WASTAGE",
];

// ─── Columns ──────────────────────────────────────────────────────────────────

const createColumns = (
	onRestore: (id: string) => void,
	_onDelete: (id: string) => void,
	isRestoring: boolean,
	_isDeleting: boolean,
): ColumnDef<TrashResponse>[] => [
	{
		accessorKey: "itemName",
		header: "Item Name",
		cell: ({ row }) => (
			<span className="font-medium">{row.original.itemName}</span>
		),
	},
	{
		accessorKey: "moduleName",
		header: "Module",
		cell: ({ row }) => (
			<Badge variant="outline" className="font-mono text-xs">
				{row.original.moduleName}
			</Badge>
		),
	},
	{
		accessorKey: "deletedBy",
		header: "Deleted By",
		cell: ({ row }) => (
			<span className="text-sm font-mono text-muted-foreground">
				{row.original.deletedBy.slice(0, 8)}…
			</span>
		),
	},
	{
		accessorKey: "date",
		header: "Deleted At",
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground whitespace-nowrap">
				{new Date(row.original.date).toLocaleString()}
			</span>
		),
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => {
			const id = row.original.id;
			return (
				<div className="flex items-center gap-2">
					{/* Restore */}
					<Button
						variant="outline"
						size="sm"
						disabled={isRestoring}
						onClick={() => onRestore(id)}
						className="gap-1.5"
					>
						<RotateCcw className="h-3.5 w-3.5" />
						Restore
					</Button>

					{/* Permanent delete */}
					{/* <AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								variant="destructive"
								size="sm"
								disabled={isDeleting}
								className="gap-1.5"
							>
								<Trash2 className="h-3.5 w-3.5" />
								Delete
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Permanently delete?</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. &quot;{row.original.itemName}
									&quot; will be permanently removed from the database.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={() => onDelete(id)}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									Delete permanently
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog> */}
				</div>
			);
		},
	},
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrashPage() {
	const [tableParams, setTableParams] = useState<PaginationParams>({
		page: 1,
		pageSize: 20,
	});
	const [moduleFilter, setModuleFilter] = useState<string | undefined>();

	const { data: result, isLoading } = useGetTrash({
		...tableParams,
		moduleName: moduleFilter,
	});

	const trash = result?.data ?? [];
	const totalCount = result?.total ?? 0;

	const { mutate: restore, isPending: isRestoring } = useRestoreItem();
	const { mutate: permanentDelete, isPending: isDeleting } =
		usePermanentDelete();

	const columns = createColumns(
		restore,
		permanentDelete,
		isRestoring,
		isDeleting,
	);

	return (
		<div className="container mx-auto p-6 space-y-4">
			<div className="grid gap-4 md:grid-cols-2">
				<MetricCard
					title="Items in Trash"
					value={totalCount.toString()}
					icon={Trash2}
				/>
				<MetricCard
					title="Module Filter"
					value={moduleFilter ?? "All"}
					icon={Filter}
				/>
			</div>

			{/* Filter bar */}
			<div className="flex items-center gap-3">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm">
							{moduleFilter ?? "All Modules"}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="max-h-64 overflow-y-auto">
						<DropdownMenuItem onSelect={() => setModuleFilter(undefined)}>
							All Modules
						</DropdownMenuItem>
						{MODULES.map((m) => (
							<DropdownMenuItem key={m} onSelect={() => setModuleFilter(m)}>
								{m}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				{moduleFilter && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setModuleFilter(undefined)}
					>
						Clear filter
					</Button>
				)}
			</div>

			<DataTable
				title="Trash"
				columns={columns}
				data={trash}
				totalCount={totalCount}
				currentPage={tableParams.page}
				pageSize={tableParams.pageSize}
				onPaginationChange={setTableParams}
				loading={isLoading}
				searchPlaceholder="Search by item name..."
			/>
		</div>
	);
}
