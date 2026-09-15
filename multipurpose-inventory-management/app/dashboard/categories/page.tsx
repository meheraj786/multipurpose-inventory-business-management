"use client";

import { AlertTriangle, CheckCircle2, Shapes } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryFormModal } from "@/components/appComponents/CategoryFormModal";
// import { useForm } from "react-hook-form";
import { Modal } from "@/components/appComponents/Modal";
import { MetricCard } from "@/components/appComponents/metric-card";
import DataTable, { type PaginationParams } from "@/components/data-table";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	// useCreateCategory,
	useDeleteCategory,
	useGetCategories,
} from "@/hooks/useCategories";
import type { CategoryData } from "@/validation/category.schema";
import { createCategoryColumns } from "./columns";

export default function CategoryPage() {
	const [tableParams, setTableParams] = useState<PaginationParams>({
		page: 1,
		pageSize: 10,
	});

	// ── Modal state ────────────────────────────────────────────────
	const [createOpen, setCreateOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<CategoryData | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<CategoryData | null>(null);

	// ── Data ───────────────────────────────────────────────────────
	const { data: result, isLoading } = useGetCategories(tableParams);
	const categories = result?.data ?? [];
	const totalCount = result?.total ?? 0;
	const emptyCount = categories.filter(
		(c) => (c.subCategories?.length ?? 0) === 0,
	).length;

	// ── Mutations ──────────────────────────────────────────────────
	const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

	// ── Columns (memoised — only recreated if callbacks change) ───
	const columns = useMemo(
		() =>
			createCategoryColumns({
				onEdit: (cat) => setEditTarget(cat),
				onDelete: (cat) => setDeleteTarget(cat),
			}),
		[],
	);

	return (
		<div className="container mx-auto p-6 space-y-4">
			{/* Metrics */}
			<div className="grid gap-4 md:grid-cols-3">
				<MetricCard
					title="Total Categories"
					value={totalCount.toString()}
					icon={Shapes}
				/>
				<MetricCard
					title="With Subcategories"
					value={(totalCount - emptyCount).toString()}
					icon={CheckCircle2}
				/>
				<MetricCard
					title="Empty Categories"
					value={emptyCount.toString()}
					icon={AlertTriangle}
				/>
			</div>

			{/* Create button + modal */}
			<Modal
				open={createOpen}
				onOpenChange={setCreateOpen}
				trigger={<Button>+ Add Category</Button>}
				title="Add Category"
			>
				<CategoryFormModal onClose={() => setCreateOpen(false)} />
			</Modal>

			{/* Edit modal */}
			<Modal
				open={!!editTarget}
				onOpenChange={(o) => !o && setEditTarget(null)}
				title="Edit Category"
			>
				{editTarget && (
					<CategoryFormModal
						category={editTarget}
						onClose={() => setEditTarget(null)}
					/>
				)}
			</Modal>

			{/* Delete alert dialog */}
			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={(o) => !o && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete category?</AlertDialogTitle>
						<AlertDialogDescription>
							<span className="font-semibold">
								&quot;{deleteTarget?.name}&quot;
							</span>{" "}
							will be moved to trash. You can restore it later from the Trash
							page.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={() => {
								if (deleteTarget) {
									deleteCategory(deleteTarget.id, {
										onSuccess: () => setDeleteTarget(null),
									});
								}
							}}
						>
							{isDeleting ? "Deleting..." : "Move to Trash"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Table */}
			<DataTable
				title="Manage Categories"
				columns={columns}
				data={categories}
				totalCount={totalCount}
				currentPage={tableParams.page}
				pageSize={tableParams.pageSize}
				onPaginationChange={setTableParams}
				loading={isLoading}
				searchPlaceholder="Search categories..."
			/>
		</div>
	);
}
