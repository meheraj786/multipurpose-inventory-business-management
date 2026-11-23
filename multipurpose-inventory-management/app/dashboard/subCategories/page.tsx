"use client";

import { ClipboardCheck, Network, Shapes } from "lucide-react";
import { useMemo, useState } from "react";
import { Modal } from "@/components/appComponents/Modal";
import { MetricCard } from "@/components/appComponents/metric-card";
import { SubCategoryFormModal } from "@/components/appComponents/SubcategoryFormModal";
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
import { useGetCategories } from "@/hooks/useCategories";
import {
	useDeleteSubCategory,
	useGetSubCategories,
} from "@/hooks/useSubcategory";
import type { SubCategoryData } from "@/validation/subcategory.schema";
import { createSubCategoryColumns } from "./columns";

export default function SubCategoryPage() {
	const [tableParams, setTableParams] = useState<PaginationParams>({
		page: 1,
		pageSize: 10,
	});

	// ── Modal state ────────────────────────────────────────────────
	const [createOpen, setCreateOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<SubCategoryData | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<SubCategoryData | null>(
		null,
	);

	// ── Data ───────────────────────────────────────────────────────
	const { data: result, isLoading } = useGetSubCategories(tableParams);
	const subCategories = result?.data ?? [];
	const totalCount = result?.total ?? 0;

	const { data: catResult } = useGetCategories({ page: 1, pageSize: 100 });
	const categoryOptions = catResult?.data ?? [];

	// ── Mutations ──────────────────────────────────────────────────
	const { mutate: deleteSubCategory, isPending: isDeleting } =
		useDeleteSubCategory();

	// ── Columns ───────────────────────────────────────────────────
	const columns = useMemo(
		() =>
			createSubCategoryColumns({
				onEdit: (sub) => setEditTarget(sub),
				onDelete: (sub) => setDeleteTarget(sub),
			}),
		[],
	);

	return (
		<div className="container mx-auto p-6 space-y-4">
			<div className="grid gap-4 md:grid-cols-3">
				<MetricCard title="Total Items" value="—" icon={ClipboardCheck} />
				<MetricCard
					title="Parent Categories"
					value={categoryOptions.length.toString()}
					icon={Shapes}
				/>
				<MetricCard
					title="Subcategories"
					value={totalCount.toString()}
					icon={Network}
				/>
			</div>

			{/* Create modal */}
			<Modal
				open={createOpen}
				onOpenChange={setCreateOpen}
				trigger={<Button>+ New Subcategory</Button>}
				title="Create Subcategory"
			>
				<SubCategoryFormModal onClose={() => setCreateOpen(false)} />
			</Modal>

			{/* Edit modal */}
			<Modal
				open={!!editTarget}
				onOpenChange={(o) => !o && setEditTarget(null)}
				title="Edit Subcategory"
			>
				{editTarget && (
					<SubCategoryFormModal
						subCategory={editTarget}
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
						<AlertDialogTitle>Delete subcategory?</AlertDialogTitle>
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
									deleteSubCategory(deleteTarget.id, {
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

			<DataTable
				title="Subcategories List"
				columns={columns}
				data={subCategories}
				totalCount={totalCount}
				currentPage={tableParams.page}
				pageSize={tableParams.pageSize}
				onPaginationChange={setTableParams}
				loading={isLoading}
				searchPlaceholder="Filter subcategories..."
			/>
		</div>
	);
}
