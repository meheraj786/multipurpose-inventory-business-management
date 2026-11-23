"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";
import type { Supplier } from "@/lib/api/services/supplier.service";
import type { CreateSupplierForm } from "@/validation/supplier.schema";

type Props = {
	onClose: () => void;
	supplier?: Supplier;
};

export function SupplierFormModal({ onClose, supplier }: Props) {
	const isEdit = !!supplier;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateSupplierForm>();

	useEffect(() => {
		if (supplier) {
			reset({
				name: supplier.name,
				contact: supplier.contact,
				email: supplier.email ?? undefined,
				companyName: supplier.companyName ?? undefined,
				address: supplier.address ?? undefined,
			});
		}
	}, [supplier, reset]);

	const { mutate: create, isPending: creating } = useCreateSupplier();
	const { mutate: update, isPending: updating } = useUpdateSupplier();
	const isPending = creating || updating;

	const onSubmit = (values: CreateSupplierForm) => {
		if (isEdit) {
			update({ id: supplier.id, payload: values }, { onSuccess: onClose });
		} else {
			create(values, { onSuccess: onClose });
		}
	};

	return (
		<form className="space-y-4 p-6" onSubmit={handleSubmit(onSubmit)}>
			<Field>
				<FieldLabel htmlFor="name">Name *</FieldLabel>
				<Input
					id="name"
					placeholder="e.g., ABC Trading"
					{...register("name", { required: "Name is required" })}
				/>
				{errors.name && <FieldError>{errors.name.message}</FieldError>}
			</Field>

			<Field>
				<FieldLabel htmlFor="contact">Contact *</FieldLabel>
				<Input
					id="contact"
					placeholder="+880 1XXXXXXXXX"
					{...register("contact", { required: "Contact is required" })}
				/>
				{errors.contact && <FieldError>{errors.contact.message}</FieldError>}
			</Field>

			<Field>
				<FieldLabel htmlFor="email">Email</FieldLabel>
				<Input
					id="email"
					type="email"
					placeholder="supplier@company.com"
					{...register("email")}
				/>
				{errors.email && <FieldError>{errors.email.message}</FieldError>}
			</Field>

			<Field>
				<FieldLabel htmlFor="companyName">Company Name</FieldLabel>
				<Input
					id="companyName"
					placeholder="Company Ltd."
					{...register("companyName")}
				/>
			</Field>

			<Field>
				<FieldLabel htmlFor="address">Address</FieldLabel>
				<Input
					id="address"
					placeholder="123 Main St, Dhaka"
					{...register("address")}
				/>
			</Field>

			<div className="flex justify-end gap-3 pt-2">
				<Button type="button" variant="ghost" onClick={onClose}>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending
						? "Saving..."
						: isEdit
							? "Update Supplier"
							: "Create Supplier"}
				</Button>
			</div>
		</form>
	);
}
