"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Shield, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Modal } from "@/components/appComponents/Modal";
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
import { Textarea } from "@/components/ui/textarea";
import {
	type Role,
	useCreateRole,
	useDeleteRole,
	useGetRoles,
	useUpdateRole,
} from "@/hooks/useRoles";
import {
	createRoleSchema,
	type RoleForm,
	type RolePermissionEntry,
} from "@/validation/role.schema";
import { PermissionsMatrix } from "../staff/permissionMatrix";

export default function RolesPage() {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingRole, setEditingRole] = useState<Role | null>(null);
	const [deleteRole, setDeleteRole] = useState<Role | null>(null);
	const [permissions, setPermissions] = useState<RolePermissionEntry[]>([]);
	const { data: roles = [], isLoading } = useGetRoles();
	const createMutation = useCreateRole();
	const updateMutation = useUpdateRole();
	const deleteMutation = useDeleteRole();
	const form = useForm<RoleForm>({
		resolver: zodResolver(createRoleSchema),
		defaultValues: { name: "", description: "", permissions: [] },
	});

	useEffect(() => {
		if (!isFormOpen) return;
		form.reset({
			name: editingRole?.name ?? "",
			description: editingRole?.description ?? "",
			permissions:
				editingRole?.permissions.map(({ module, actions }) => ({
					module,
					actions,
				})) ?? [],
		});
		setPermissions(
			editingRole?.permissions.map(({ module, actions }) => ({
				module,
				actions,
			})) ?? [],
		);
	}, [editingRole, form, isFormOpen]);

	const openCreate = () => {
		setEditingRole(null);
		setIsFormOpen(true);
	};

	const openEdit = (role: Role) => {
		setEditingRole(role);
		setIsFormOpen(true);
	};

	const handleSave = form.handleSubmit(async (values) => {
		const payload = { ...values, permissions };
		try {
			if (editingRole) {
				await updateMutation.mutateAsync({ id: editingRole.id, ...payload });
				toast.success("Role updated successfully");
			} else {
				await createMutation.mutateAsync(payload);
				toast.success("Role created successfully");
			}
			setIsFormOpen(false);
			setEditingRole(null);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Could not save this role",
			);
		}
	});

	const handleDelete = async () => {
		if (!deleteRole) return;
		try {
			await deleteMutation.mutateAsync(deleteRole.id);
			toast.success("Role deleted successfully");
			setDeleteRole(null);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Could not delete this role",
			);
		}
	};

	return (
		<div className="container mx-auto space-y-6 p-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">Roles & Permissions</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Create reusable roles, then assign them to staff.
					</p>
				</div>
				<Button onClick={openCreate}>
					<Plus className="mr-2 h-4 w-4" />
					Create Role
				</Button>
			</div>

			{isLoading ? (
				<p className="text-sm text-muted-foreground">Loading roles...</p>
			) : roles.length === 0 ? (
				<div className="rounded-lg border border-dashed p-10 text-center">
					<Shield className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
					<p className="font-medium">No custom roles yet</p>
					<p className="mt-1 text-sm text-muted-foreground">
						Create a role to define what staff can see and do.
					</p>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{roles.map((role) => (
						<div
							key={role.id}
							className="space-y-4 rounded-lg border bg-card p-5"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<h2 className="truncate font-semibold">{role.name}</h2>
									<p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted-foreground">
										{role.description || "No description"}
									</p>
								</div>
								<Shield className="h-5 w-5 shrink-0 text-primary" />
							</div>
							<div className="flex items-center justify-between text-sm text-muted-foreground">
								<span>
									{role.permissions.length} module
									{role.permissions.length === 1 ? "" : "s"}
								</span>
								<span className="inline-flex items-center gap-1">
									<Users className="h-4 w-4" />
									{role._count?.users ?? 0} staff
								</span>
							</div>
							<div className="flex justify-end gap-2 border-t pt-3">
								<Button
									variant="outline"
									size="sm"
									onClick={() => openEdit(role)}
								>
									<Pencil className="mr-2 h-4 w-4" />
									Edit
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setDeleteRole(role)}
								>
									<Trash2 className="mr-2 h-4 w-4 text-destructive" />
									Delete
								</Button>
							</div>
						</div>
					))}
				</div>
			)}

			<Modal
				open={isFormOpen}
				onOpenChange={setIsFormOpen}
				title={editingRole ? "Edit Role" : "Create Role"}
				className="h-[90vh] max-w-5xl"
			>
				<form
					onSubmit={handleSave}
					className="flex h-[calc(90vh-5rem)] flex-col gap-5 p-5"
				>
					<div className="grid shrink-0 gap-4 md:grid-cols-2">
						<Field>
							<FieldLabel>Role name</FieldLabel>
							<Input {...form.register("name")} placeholder="e.g. Cashier" />
							{form.formState.errors.name && (
								<FieldError>{form.formState.errors.name.message}</FieldError>
							)}
						</Field>
						<Field>
							<FieldLabel>Description (optional)</FieldLabel>
							<Textarea
								{...form.register("description")}
								rows={2}
								placeholder="Describe this role's responsibilities"
							/>
							{form.formState.errors.description && (
								<FieldError>
									{form.formState.errors.description.message}
								</FieldError>
							)}
						</Field>
					</div>
					<PermissionsMatrix value={permissions} onChange={setPermissions} />
					{form.formState.errors.permissions && (
						<p className="text-sm text-destructive">
							{form.formState.errors.permissions.message}
						</p>
					)}
					<div className="flex shrink-0 justify-end gap-2 border-t pt-4">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setIsFormOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={createMutation.isPending || updateMutation.isPending}
						>
							{createMutation.isPending || updateMutation.isPending
								? "Saving..."
								: editingRole
									? "Save Changes"
									: "Create Role"}
						</Button>
					</div>
				</form>
			</Modal>

			<AlertDialog
				open={!!deleteRole}
				onOpenChange={(open) => !open && setDeleteRole(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete {deleteRole?.name}?</AlertDialogTitle>
						<AlertDialogDescription>
							Unassign this role from all active staff before deleting it.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteMutation.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(event) => {
								event.preventDefault();
								void handleDelete();
							}}
							disabled={deleteMutation.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete Role"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
