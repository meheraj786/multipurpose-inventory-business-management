"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Activity, Filter, User } from "lucide-react";
import { useState } from "react";
import { MetricCard } from "@/components/appComponents/metric-card";
import DataTable, { type PaginationParams } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetActivityLogs } from "@/hooks/useActivityLog";
import { useModelGuard } from "@/hooks/useModelGuard";
import type { ActivityLogResponse } from "@/lib/api/services/activityLogService";

// ─── Action badge colors ──────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, string> = {
	CREATE: "bg-green-100 text-green-700",
	UPDATE: "bg-blue-100 text-blue-700",
	DELETE: "bg-red-100 text-red-700",
	LOGIN: "bg-purple-100 text-purple-700",
	LOGOUT: "bg-slate-100 text-slate-600",
	RESTORE: "bg-yellow-100 text-yellow-700",
	STOCK_IN: "bg-teal-100 text-teal-700",
	STOCK_OUT: "bg-orange-100 text-orange-700",
};

// ─── Columns ──────────────────────────────────────────────────────────────────

const activityLogColumns: ColumnDef<ActivityLogResponse>[] = [
	{
		accessorKey: "dateTime",
		header: "Time",
		cell: ({ row }) => {
			const date = new Date(row.original.dateTime);
			return (
				<span className="text-sm text-muted-foreground whitespace-nowrap">
					{date.toLocaleString()}
				</span>
			);
		},
	},
	{
		accessorKey: "user",
		header: "User",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<User className="h-3.5 w-3.5 text-muted-foreground" />
				<span className="text-sm">{row.original.user?.email ?? "—"}</span>
			</div>
		),
	},
	{
		accessorKey: "module",
		header: "Module",
		cell: ({ row }) => (
			<Badge variant="outline" className="font-mono text-xs">
				{row.original.module}
			</Badge>
		),
	},
	{
		accessorKey: "action",
		header: "Action",
		cell: ({ row }) => {
			const color =
				ACTION_COLORS[row.original.action] ?? "bg-slate-100 text-slate-600";
			return (
				<span
					className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}
				>
					{row.original.action}
				</span>
			);
		},
	},
	{
		accessorKey: "details",
		header: "Details",
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">
				{row.original.details ?? "—"}
			</span>
		),
	},
];

// ─── System modules and actions for filters ───────────────────────────────────

const MODULES = [
	"AUTH",
	"USER",
	"ACCOUNT",
	"CATEGORY",
	"SUBCATEGORY",
	"SUPPLIER",
	"PRODUCT",
	"RAW_PRODUCT",
	"PREPARED_PRODUCT",
	"PURCHASE",
	"SERVICE",
	"CUSTOMER",
	"SALE",
	"WASTAGE",
	"INVOICE",
	"PERMISSION",
	"STOCK",
];

const ACTIONS = [
	"CREATE",
	"READ",
	"UPDATE",
	"DELETE",
	"RESTORE",
	"LOGIN",
	"LOGOUT",
	"STOCK_IN",
	"STOCK_OUT",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ActivityLogPage() {
	useModelGuard("admin");
	const [tableParams, setTableParams] = useState<PaginationParams>({
		page: 1,
		pageSize: 20,
	});
	const [moduleFilter, setModuleFilter] = useState<string | undefined>();
	const [actionFilter, setActionFilter] = useState<string | undefined>();

	const { data: result, isLoading } = useGetActivityLogs({
		...tableParams,
		module: moduleFilter,
		action: actionFilter,
	});

	const logs = result?.data ?? [];
	const totalCount = result?.total ?? 0;

	const clearFilters = () => {
		setModuleFilter(undefined);
		setActionFilter(undefined);
	};

	const hasActiveFilters = !!moduleFilter || !!actionFilter;

	return (
		<div className="container mx-auto p-6 space-y-4">
			<div className="grid gap-4 md:grid-cols-3">
				<MetricCard
					title="Total Logs"
					value={totalCount.toString()}
					icon={Activity}
				/>
				<MetricCard
					title="Module Filter"
					value={moduleFilter ?? "All"}
					icon={Filter}
				/>
				<MetricCard
					title="Action Filter"
					value={actionFilter ?? "All"}
					icon={Activity}
				/>
			</div>

			{/* Filter bar */}
			<div className="flex items-center gap-3 flex-wrap">
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

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm">
							{actionFilter ?? "All Actions"}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem onSelect={() => setActionFilter(undefined)}>
							All Actions
						</DropdownMenuItem>
						{ACTIONS.map((a) => (
							<DropdownMenuItem key={a} onSelect={() => setActionFilter(a)}>
								{a}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				{hasActiveFilters && (
					<Button variant="ghost" size="sm" onClick={clearFilters}>
						Clear filters
					</Button>
				)}
			</div>

			<DataTable
				title="Activity Logs"
				columns={activityLogColumns}
				data={logs}
				totalCount={totalCount}
				currentPage={tableParams.page}
				pageSize={tableParams.pageSize}
				onPaginationChange={setTableParams}
				loading={isLoading}
				searchPlaceholder="Search by details..."
			/>
		</div>
	);
}
