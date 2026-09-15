"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Trash2, UserCheck, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/appComponents/Modal";
import { MetricCard } from "@/components/appComponents/metric-card";
import DataTable from "@/components/data-table";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	useCreateCustomer,
	useDeleteCustomer,
	useGetCustomers,
	useUpdateCustomer,
} from "@/hooks/useCustomer";
import {
	type CreateCustomerForm,
	type CustomerData,
	createCustomerSchema,
	type UpdateCustomerForm,
	updateCustomerSchema,
} from "@/validation/customer.schema";
import { createCustomerColumns } from "./columns";

export default function CustomerPage() {
	const [tableParams, setTableParams] = useState({ page: 1, pageSize: 10 });
	const [createOpen, setCreateOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<CustomerData | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<CustomerData | null>(null);

	const { data: result, isLoading } = useGetCustomers(tableParams);
	const customers = result?.data ?? [];
	const totalCount = result?.total ?? 0;
	const memberCount = customers.filter((c) => c.hasMembership).length;

	const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer();
	const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer();
	const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();

	const createForm = useForm<CreateCustomerForm>({
		resolver: zodResolver(createCustomerSchema),
		defaultValues: {
			name: "",
			phone: "",
			email: "",
			address: "",
			hasMembership: false,
		},
	});

	const onCreateSubmit = createForm.handleSubmit((values) => {
		createCustomer(
			{
				...values,
				email: values.email || undefined,
				address: values.address || undefined,
			},
			{
				onSuccess: () => {
					createForm.reset();
					setCreateOpen(false);
				},
			},
		);
	});

	const editForm = useForm<UpdateCustomerForm>({
		resolver: zodResolver(updateCustomerSchema),
		defaultValues: {
			name: "",
			phone: "",
			email: "",
			address: "",
			hasMembership: false,
		},
	});

	const openEdit = (customer: CustomerData) => {
		editForm.reset({
			name: customer.name,
			phone: customer.phone,
			email: customer.email ?? "",
			address: customer.address ?? "",
			hasMembership: customer.hasMembership,
		});
		setEditTarget(customer);
	};

	const onEditSubmit = editForm.handleSubmit((values) => {
		if (!editTarget) return;

		updateCustomer(
			{
				id: editTarget.id,
				payload: {
					...values,
					email: values.email || undefined,
					address: values.address || undefined,
				},
			},
			{
				onSuccess: () => {
					editForm.reset();
					setEditTarget(null);
				},
			},
		);
	});

	// --- Delete ---
	const onConfirmDelete = () => {
		if (!deleteTarget) return;
		deleteCustomer(deleteTarget.id, {
			onSuccess: () => setDeleteTarget(null),
		});
	};

	const columns = createCustomerColumns({
		onEdit: openEdit,
		onDelete: setDeleteTarget,
	});

	return (
		<div className="container mx-auto p-6 space-y-4">
			{/* Metrics */}
			<div className="grid gap-4 md:grid-cols-3">
				<MetricCard
					title="Total Customers"
					value={totalCount.toString()}
					icon={Users}
				/>
				<MetricCard
					title="Members"
					value={memberCount.toString()}
					icon={BadgeCheck}
				/>
				<MetricCard
					title="Non-Members"
					value={(totalCount - memberCount).toString()}
					icon={UserCheck}
				/>
			</div>

			{/* Create Modal */}
			<Modal
				open={createOpen}
				onOpenChange={setCreateOpen}
				trigger={<Button>+ Add Customer</Button>}
				title="Add Customer"
			>
				<form className="space-y-5 p-6" onSubmit={onCreateSubmit}>
					<Field>
						<FieldLabel htmlFor="create-name">Full Name</FieldLabel>
						<Input
							id="create-name"
							placeholder="e.g., John Doe"
							className="mt-2"
							{...createForm.register("name")}
						/>
						{createForm.formState.errors.name && (
							<FieldError>
								{createForm.formState.errors.name.message}
							</FieldError>
						)}
					</Field>

					<Field>
						<FieldLabel htmlFor="create-phone">Phone</FieldLabel>
						<Input
							id="create-phone"
							placeholder="e.g., +8801XXXXXXXXX"
							className="mt-2"
							{...createForm.register("phone")}
						/>
						{createForm.formState.errors.phone && (
							<FieldError>
								{createForm.formState.errors.phone.message}
							</FieldError>
						)}
					</Field>

					<Field>
						<FieldLabel htmlFor="create-email">Email (optional)</FieldLabel>
						<Input
							id="create-email"
							type="email"
							placeholder="e.g., john@example.com"
							className="mt-2"
							{...createForm.register("email")}
						/>
						{createForm.formState.errors.email && (
							<FieldError>
								{createForm.formState.errors.email.message}
							</FieldError>
						)}
					</Field>

					<Field>
						<FieldLabel htmlFor="create-address">Address (optional)</FieldLabel>
						<Input
							id="create-address"
							placeholder="e.g., 123 Main St"
							className="mt-2"
							{...createForm.register("address")}
						/>
					</Field>

					<Field>
						<div className="flex items-center gap-2 mt-2">
							<Checkbox
								id="create-membership"
								checked={createForm.watch("hasMembership")}
								onCheckedChange={(checked) =>
									createForm.setValue("hasMembership", !!checked)
								}
							/>
							<FieldLabel
								htmlFor="create-membership"
								className="cursor-pointer"
							>
								Has Membership
							</FieldLabel>
						</div>
					</Field>

					<div className="flex justify-end gap-3 pt-2">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setCreateOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isCreating}>
							{isCreating ? "Saving..." : "Save Customer"}
						</Button>
					</div>
				</form>
			</Modal>

			{/* Edit Modal */}
			<Modal
				open={!!editTarget}
				onOpenChange={(open) => {
					if (!open) setEditTarget(null);
				}}
				title="Edit Customer"
			>
				<form className="space-y-5 p-6" onSubmit={onEditSubmit}>
					<Field>
						<FieldLabel htmlFor="edit-name">Full Name</FieldLabel>
						<Input
							id="edit-name"
							placeholder="e.g., John Doe"
							className="mt-2"
							{...editForm.register("name")}
						/>
						{editForm.formState.errors.name && (
							<FieldError>{editForm.formState.errors.name.message}</FieldError>
						)}
					</Field>

					<Field>
						<FieldLabel htmlFor="edit-phone">Phone</FieldLabel>
						<Input
							id="edit-phone"
							placeholder="e.g., +8801XXXXXXXXX"
							className="mt-2"
							{...editForm.register("phone")}
						/>
						{editForm.formState.errors.phone && (
							<FieldError>{editForm.formState.errors.phone.message}</FieldError>
						)}
					</Field>

					<Field>
						<FieldLabel htmlFor="edit-email">Email (optional)</FieldLabel>
						<Input
							id="edit-email"
							type="email"
							placeholder="e.g., john@example.com"
							className="mt-2"
							{...editForm.register("email")}
						/>
						{editForm.formState.errors.email && (
							<FieldError>{editForm.formState.errors.email.message}</FieldError>
						)}
					</Field>

					<Field>
						<FieldLabel htmlFor="edit-address">Address (optional)</FieldLabel>
						<Input
							id="edit-address"
							placeholder="e.g., 123 Main St"
							className="mt-2"
							{...editForm.register("address")}
						/>
					</Field>

					<Field>
						<div className="flex items-center gap-2 mt-2">
							<Checkbox
								id="edit-membership"
								checked={editForm.watch("hasMembership")}
								onCheckedChange={(checked) =>
									editForm.setValue("hasMembership", !!checked)
								}
							/>
							<FieldLabel htmlFor="edit-membership" className="cursor-pointer">
								Has Membership
							</FieldLabel>
						</div>
					</Field>

					<div className="flex justify-end gap-3 pt-2">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setEditTarget(null)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isUpdating}>
							{isUpdating ? "Updating..." : "Update Customer"}
						</Button>
					</div>
				</form>
			</Modal>

			{/* Delete Confirmation */}
			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<Trash2 className="h-5 w-5 text-red-500" />
							Move to Trash
						</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to move{" "}
							<span className="font-semibold text-foreground">
								{deleteTarget?.name}
							</span>{" "}
							to trash? You can restore them later.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-red-600 hover:bg-red-700"
							onClick={onConfirmDelete}
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting..." : "Move to Trash"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Table */}
			<DataTable
				title="Manage Customers"
				columns={columns}
				data={customers}
				totalCount={totalCount}
				currentPage={tableParams.page}
				pageSize={tableParams.pageSize}
				onPaginationChange={setTableParams}
				loading={isLoading}
				searchPlaceholder="Search by name or phone..."
			/>
		</div>
	);
}
