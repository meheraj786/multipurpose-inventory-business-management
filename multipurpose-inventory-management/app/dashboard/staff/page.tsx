"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Shield, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	type StaffMember,
	useCreateStaff,
	useDeleteStaff,
	useGetStaff,
	useUpdateStaff,
} from "@/hooks/useStaff";
import {
	type CreateStaffForm,
	createStaffSchema,
	type UpdateStaffForm,
	updateStaffSchema,
} from "@/validation/staff.schema";
import { getStaffColumns } from "./columns";
import { PermissionsMatrix } from "./permissionMatrix";

export default function StaffPage() {
	const [createOpen, setCreateOpen] = useState(false);
	const [editStaff, setEditStaff] = useState<StaffMember | null>(null);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [permissionStaff, setPermissionStaff] = useState<StaffMember | null>(
		null,
	);
	const [tableParams, setTableParams] = useState({ page: 1, pageSize: 10 });

	const { data: result, isLoading } = useGetStaff(tableParams);
	const { mutate: createStaff, isPending: isCreating } = useCreateStaff();
	const { mutate: updateStaff, isPending: isUpdating } = useUpdateStaff();
	const { mutate: deleteStaff, isPending: isDeleting } = useDeleteStaff();

	const staffList = result?.data ?? [];
	const totalCount = result?.meta.total ?? 0;

	// Add Staff Form
	const createForm = useForm<CreateStaffForm>({
		resolver: zodResolver(createStaffSchema),
		defaultValues: { name: "", email: "", password: "" },
	});

	// Edit Staff Form
	const editForm = useForm<UpdateStaffForm>({
		resolver: zodResolver(updateStaffSchema),
	});

	// Sync edit form when editStaff changes
	useEffect(() => {
		if (editStaff) {
			editForm.reset({
				name: editStaff.name ?? "",
				email: editStaff.email,
			});
		}
	}, [editStaff, editForm]);

	const onAddStaffSubmit = (values: CreateStaffForm) => {
		createStaff(values, {
			onSuccess: () => {
				setCreateOpen(false);
				createForm.reset();
				toast.success("Staff member created successfully");
			},
		});
	};

	const onEditStaffSubmit = (values: UpdateStaffForm) => {
		if (!editStaff) return;
		updateStaff(
			{ id: editStaff.id, ...values },
			{
				onSuccess: () => {
					setEditStaff(null);
					toast.success("Staff member updated successfully");
				},
			},
		);
	};

	const handleDelete = () => {
		if (!deleteId) return;
		deleteStaff(deleteId, {
			onSuccess: () => {
				setDeleteId(null);
				toast.success("Staff member deleted successfully");
			},
		});
	};

	const columns = useMemo(
		() =>
			getStaffColumns({
				onEdit: (staff) => setEditStaff(staff),
				onManagePermissions: (staff) => setPermissionStaff(staff),
				onDelete: (id) => setDeleteId(id),
			}),
		[],
	);

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Metrics */}
			<div className="grid gap-4 md:grid-cols-3">
				<MetricCard
					title="Total Staff"
					value={totalCount.toString()}
					icon={Users}
				/>
				<MetricCard title="Active Plans" value="Premium" icon={Shield} />
				<MetricCard title="System Role" value="Admin" icon={Shield} />
			</div>

			<div className="flex justify-between items-center">
				<h2 className="text-xl font-bold">Staff Members</h2>
				<Button onClick={() => setCreateOpen(true)}>
					<Plus className="mr-2 h-4 w-4" /> Add Staff
				</Button>
			</div>

			{/* Add Staff Modal */}
			<Modal
				open={createOpen}
				onOpenChange={setCreateOpen}
				title="Add New Staff Member"
			>
				<form
					onSubmit={createForm.handleSubmit(onAddStaffSubmit)}
					className="space-y-4 p-4"
				>
					<Field>
						<FieldLabel>Full Name</FieldLabel>
						<Input {...createForm.register("name")} placeholder="John Doe" />
						{createForm.formState.errors.name && (
							<FieldError>
								{createForm.formState.errors.name.message}
							</FieldError>
						)}
					</Field>
					<Field>
						<FieldLabel>Email Address</FieldLabel>
						<Input
							{...createForm.register("email")}
							type="email"
							placeholder="john@example.com"
						/>
						{createForm.formState.errors.email && (
							<FieldError>
								{createForm.formState.errors.email.message}
							</FieldError>
						)}
					</Field>
					<Field>
						<FieldLabel>Initial Password</FieldLabel>
						<Input
							{...createForm.register("password")}
							type="password"
							placeholder="******"
						/>
						{createForm.formState.errors.password && (
							<FieldError>
								{createForm.formState.errors.password.message}
							</FieldError>
						)}
					</Field>
					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setCreateOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isCreating}>
							{isCreating ? "Creating..." : "Create Staff"}
						</Button>
					</div>
				</form>
			</Modal>

			{/* Edit Staff Modal */}
			<Modal
				open={!!editStaff}
				onOpenChange={(open) => !open && setEditStaff(null)}
				title="Edit Staff Member"
			>
				<form
					onSubmit={editForm.handleSubmit(onEditStaffSubmit)}
					className="space-y-4 p-4"
				>
					<Field>
						<FieldLabel>Full Name</FieldLabel>
						<Input {...editForm.register("name")} placeholder="John Doe" />
						{editForm.formState.errors.name && (
							<FieldError>{editForm.formState.errors.name.message}</FieldError>
						)}
					</Field>
					<Field>
						<FieldLabel>Email Address</FieldLabel>
						<Input
							{...editForm.register("email")}
							type="email"
							placeholder="john@example.com"
						/>
						{editForm.formState.errors.email && (
							<FieldError>{editForm.formState.errors.email.message}</FieldError>
						)}
					</Field>
					<Field>
						<FieldLabel>New Password (Optional)</FieldLabel>
						<Input
							{...editForm.register("password")}
							type="password"
							placeholder="Leave blank to keep current"
						/>
						{editForm.formState.errors.password && (
							<FieldError>
								{editForm.formState.errors.password.message}
							</FieldError>
						)}
					</Field>
					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setEditStaff(null)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isUpdating}>
							{isUpdating ? "Updating..." : "Update Staff"}
						</Button>
					</div>
				</form>
			</Modal>

			<Modal
				open={!!permissionStaff}
				onOpenChange={(open) => !open && setPermissionStaff(null)}
				title="Manage Staff Permissions"
				className="  h-[90vh] flex flex-col"
			>
				{permissionStaff && (
					<PermissionsMatrix
						staffId={permissionStaff.id}
						staffEmail={permissionStaff.email}
						existingPermissions={permissionStaff.permissions || []}
						onClose={() => setPermissionStaff(null)}
					/>
				)}
			</Modal>

			{/* Delete Confirmation */}
			<AlertDialog
				open={!!deleteId}
				onOpenChange={(open) => !open && setDeleteId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							staff member and remove their access to the system.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								handleDelete();
							}}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Data Table */}
			<DataTable
				columns={columns}
				data={staffList}
				totalCount={totalCount}
				loading={isLoading}
				currentPage={tableParams.page}
				pageSize={tableParams.pageSize}
				onPaginationChange={setTableParams}
			/>
		</div>
	);
}
