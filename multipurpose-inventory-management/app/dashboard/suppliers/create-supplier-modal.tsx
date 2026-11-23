"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateSupplier } from "@/hooks/useSuppliers";
import {
	type CreateSupplierForm,
	createSupplierSchema,
} from "@/validation/supplier.schema";

type Props = { onClose: () => void };

export function CreateSupplierModal({ onClose }: Props) {
	const createSupplierMutation = useCreateSupplier();
	const { mutate: createSupplier, isPending: isLoading } =
		createSupplierMutation;

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateSupplierForm>({
		resolver: zodResolver(createSupplierSchema),
		defaultValues: {
			name: "",
			contact: "",
			email: "",
			companyName: "",
			address: "",
		},
	});

	const onSubmit = (values: CreateSupplierForm) => {
		const cleanedValues = { ...values };
		if (cleanedValues.email === "") delete cleanedValues.email;
		if (cleanedValues.companyName === "") delete cleanedValues.companyName;
		if (cleanedValues.address === "") delete cleanedValues.address;

		createSupplier(cleanedValues, { onSuccess: onClose });
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
			<Field>
				<FieldLabel>Name</FieldLabel>
				<Input {...register("name")} />
				{errors.name && <FieldError>{errors.name.message}</FieldError>}
			</Field>

			<Field>
				<FieldLabel>Contact</FieldLabel>
				<Input {...register("contact")} />
				{errors.contact && <FieldError>{errors.contact.message}</FieldError>}
			</Field>

			<Field>
				<FieldLabel>Email</FieldLabel>
				<Input {...register("email")} />
				{errors.email && <FieldError>{errors.email.message}</FieldError>}
			</Field>

			<Field>
				<FieldLabel>Company</FieldLabel>
				<Input {...register("companyName")} />
				{errors.companyName && (
					<FieldError>{errors.companyName.message}</FieldError>
				)}
			</Field>

			<Field>
				<FieldLabel>Address</FieldLabel>
				<Input {...register("address")} />
				{errors.address && <FieldError>{errors.address.message}</FieldError>}
			</Field>

			{createSupplierMutation.error && (
				<div className="text-sm text-destructive">
					{createSupplierMutation.error?.message ?? "Failed to create supplier"}
				</div>
			)}

			<div className="flex justify-end gap-3 pt-2">
				<Button type="button" variant="ghost" onClick={onClose}>
					Cancel
				</Button>
				<Button type="submit" disabled={isLoading}>
					{isLoading ? "Creating..." : "Create Supplier"}
				</Button>
			</div>
		</form>
	);
}
