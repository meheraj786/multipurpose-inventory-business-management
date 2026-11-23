"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	ArrowRight,
	Building2,
	CreditCard,
	FileSignature,
	ImageIcon,
	PlusCircle,
	Receipt,
	Save,
	Shield,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	useCreateAccount,
	useGetMyAccount,
	useUpdateMyAccount,
} from "@/hooks/useAccount";
import {
	type CreateAccountInput,
	createAccountSchema,
	type UpdateAccountInput,
	updateAccountSchema,
} from "@/validation/account.schema";

export default function AccountSettingsPage() {
	const { data: account, isLoading, isError } = useGetMyAccount();
	const updateAccountMutation = useUpdateMyAccount();
	const createAccountMutation = useCreateAccount();

	const isCreateMode = !isLoading && (!account || isError);

	const editForm = useForm<UpdateAccountInput>({
		resolver: zodResolver(updateAccountSchema),
		defaultValues: {
			companyName: "",
			category: "",
			type: "",
			model: "RETAIL",
			logo: "",
			saleIdPrefix: "",
			footerNotes: "",
			digitalSignature: "",
			currency: "USD",
		},
	});

	const createForm = useForm<CreateAccountInput>({
		resolver: zodResolver(createAccountSchema),
		defaultValues: {
			companyName: "",
			category: "",
			type: "",
			model: "RETAIL",
			logo: "",
			saleIdPrefix: "",
			footerNotes: "",
			digitalSignature: "",
			currency: "USD",
			status: "ACTIVE",
		},
	});

	useEffect(() => {
		if (account) {
			editForm.reset({
				companyName: account.companyName,
				category: account.category,
				type: account.type,
				model: account.model,
				logo: account.logo || "",
				saleIdPrefix: account.saleIdPrefix || "",
				footerNotes: account.footerNotes || "",
				digitalSignature: account.digitalSignature || "",
				currency: account.currency,
			});
		}
	}, [account, editForm]);

	const onUpdateSubmit = (data: UpdateAccountInput) => {
		updateAccountMutation.mutate(data, {
			onSuccess: () => {
				toast.success("Account profile updated successfully");
			},
			onError: (error) => {
				toast.error(error.message || "Failed to update account details");
			},
		});
	};

	const onCreateSubmit = (data: CreateAccountInput) => {
		createAccountMutation.mutate(data, {
			onSuccess: () => {
				toast.success("Account created and initialized successfully");
			},
			onError: (error) => {
				toast.error(error.message || "Failed to create account profile");
			},
		});
	};

	if (isLoading) {
		let i = 0;
		return (
			<div className="mx-auto max-w-6xl space-y-8 p-6 md:p-8">
				<div className="flex items-center justify-between">
					<div className="space-y-2">
						<Skeleton className="h-10 w-48" />
						<Skeleton className="h-4 w-72" />
					</div>
					<Skeleton className="h-8 w-24" />
				</div>
				<div className="space-y-6">
					<Skeleton className="h-10 w-96" />
					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-36" />
							<Skeleton className="h-4 w-64" />
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid gap-6 md:grid-cols-2">
								{Array.from({ length: 6 }).map((_) => (
									<div key={i++} className="space-y-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-10 w-full" />
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (isCreateMode) {
		return (
			<div className="mx-auto max-w-3xl space-y-8 p-6 md:p-8">
				<div className="text-center md:text-left">
					<h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
						Set Up Your Organization
					</h1>
					<p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
						Welcome! Provide the basic parameters below to initialize your
						workspace.
					</p>
				</div>

				<form
					onSubmit={createForm.handleSubmit(onCreateSubmit)}
					className="space-y-6"
				>
					<Card className="border-neutral-200 dark:border-neutral-800">
						<CardHeader>
							<div className="flex items-center gap-2">
								<PlusCircle className="h-5 w-5 text-primary" />
								<CardTitle>Organization Registration</CardTitle>
							</div>
							<CardDescription>
								Configure basic metadata and functional options for your
								operation.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid gap-6 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="create-companyName">Corporate Name</Label>
									<Input
										id="create-companyName"
										{...createForm.register("companyName")}
										placeholder="e.g. Acme Corp"
										className={
											createForm.formState.errors.companyName
												? "border-destructive"
												: ""
										}
									/>
									{createForm.formState.errors.companyName && (
										<p className="text-xs text-destructive">
											{createForm.formState.errors.companyName.message}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="create-currency">Functional Currency</Label>
									<select
										id="create-currency"
										{...createForm.register("currency")}
										className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300"
									>
										<option value="USD">USD ($)</option>
										<option value="BDT">BDT (৳)</option>
										<option value="EUR">EUR (€)</option>
										<option value="GBP">GBP (£)</option>
									</select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="create-category">Industrial Segment</Label>
									<Input
										id="create-category"
										{...createForm.register("category")}
										placeholder="e.g. Technology"
										className={
											createForm.formState.errors.category
												? "border-destructive"
												: ""
										}
									/>
									{createForm.formState.errors.category && (
										<p className="text-xs text-destructive">
											{createForm.formState.errors.category.message}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="create-type">Operational Type</Label>
									<Input
										id="create-type"
										{...createForm.register("type")}
										placeholder="e.g. Manufacturer"
										className={
											createForm.formState.errors.type
												? "border-destructive"
												: ""
										}
									/>
									{createForm.formState.errors.type && (
										<p className="text-xs text-destructive">
											{createForm.formState.errors.type.message}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="create-model">Operational Model</Label>
									<select
										id="create-model"
										{...createForm.register("model")}
										className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300"
									>
										<option value="RETAIL">Retail</option>
										<option value="SERVICE">Service</option>
										<option value="RESTAURANT">Restaurant</option>
										<option value="RETAIL_AND_SERVICE">Retail & Service</option>
										<option value="SERVICE_AND_RESTAURANT">
											Service & Restaurant
										</option>
										<option value="RETAIL_AND_RESTAURANT">
											Retail & Restaurant
										</option>
										<option value="RETAIL_AND_SERVICE_AND_RESTAURANT">
											Enterprise (All Services)
										</option>
									</select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="create-logo">Media Assets (Logo URL)</Label>
									<div className="relative">
										<ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
										<Input
											id="create-logo"
											{...createForm.register("logo")}
											className="pl-9"
											placeholder="https://..."
										/>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<div className="flex justify-end gap-3">
						<Button
							type="submit"
							disabled={createAccountMutation.isPending}
							className="flex items-center gap-2 px-6"
						>
							{createAccountMutation.isPending ? (
								<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
							) : (
								<ArrowRight className="h-4 w-4" />
							)}
							Initialize Workspace
						</Button>
					</div>
				</form>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-6xl space-y-8 p-6 md:p-8">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
						Account Profile
					</h1>
					<p className="text-sm text-neutral-500 dark:text-neutral-400">
						Configure details, invoice structures, and active integrations.
					</p>
				</div>
				<div className="flex items-center gap-3">
					{account?.status && (
						<Badge
							variant={
								account.status === "ACTIVE"
									? "default"
									: account.status === "SUSPENDED"
										? "destructive"
										: "secondary"
							}
							className="px-3 py-1 font-semibold"
						>
							{account.status}
						</Badge>
					)}
				</div>
			</div>

			<form
				onSubmit={editForm.handleSubmit(onUpdateSubmit)}
				className="space-y-6"
			>
				<Tabs defaultValue="profile" className="w-full space-y-6">
					<TabsList className="grid w-full grid-cols-3 lg:max-w-md">
						<TabsTrigger value="profile" className="flex items-center gap-2">
							<Building2 className="h-4 w-4" />
							Organization
						</TabsTrigger>
						<TabsTrigger value="billing" className="flex items-center gap-2">
							<Receipt className="h-4 w-4" />
							Invoices
						</TabsTrigger>
						<TabsTrigger
							value="subscription"
							className="flex items-center gap-2"
						>
							<CreditCard className="h-4 w-4" />
							Billing
						</TabsTrigger>
					</TabsList>

					<TabsContent value="profile" className="space-y-6">
						<Card className="border-neutral-200 dark:border-neutral-800">
							<CardHeader>
								<CardTitle>Identity settings</CardTitle>
								<CardDescription>
									Basic parameters defining your trade name and structural
									patterns.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid gap-6 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="edit-companyName">Corporate Name</Label>
										<Input
											id="edit-companyName"
											{...editForm.register("companyName")}
											className={
												editForm.formState.errors.companyName
													? "border-destructive"
													: ""
											}
										/>
										{editForm.formState.errors.companyName && (
											<p className="text-xs text-destructive">
												{editForm.formState.errors.companyName.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="edit-currency">Functional Currency</Label>
										<select
											id="edit-currency"
											{...editForm.register("currency")}
											className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300"
										>
											<option value="USD">USD ($)</option>
											<option value="BDT">BDT (৳)</option>
											<option value="EUR">EUR (€)</option>
											<option value="GBP">GBP (£)</option>
										</select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="edit-category">Industrial Segment</Label>
										<Input
											id="edit-category"
											{...editForm.register("category")}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="edit-type">Operational Type</Label>
										<Input id="edit-type" {...editForm.register("type")} />
									</div>

									<div className="space-y-2">
										<Label htmlFor="edit-model">Operational Model</Label>
										<select
											id="edit-model"
											{...editForm.register("model")}
											className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300"
										>
											<option value="RETAIL">Retail</option>
											<option value="SERVICE">Service</option>
											<option value="RESTAURANT">Restaurant</option>
											<option value="RETAIL_AND_SERVICE">
												Retail & Service
											</option>
											<option value="SERVICE_AND_RESTAURANT">
												Service & Restaurant
											</option>
											<option value="RETAIL_AND_RESTAURANT">
												Retail & Restaurant
											</option>
											<option value="RETAIL_AND_SERVICE_AND_RESTAURANT">
												Enterprise (All Services)
											</option>
										</select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="edit-logo">Media Assets (Logo URL)</Label>
										<div className="flex gap-2">
											<div className="relative flex-1">
												<ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
												<Input
													id="edit-logo"
													{...editForm.register("logo")}
													className="pl-9"
													placeholder="https://"
												/>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="billing" className="space-y-6">
						<Card className="border-neutral-200 dark:border-neutral-800">
							<CardHeader>
								<CardTitle>Invoicing preferences</CardTitle>
								<CardDescription>
									Establish details representing fiscal formats printed on sales
									receipts.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid gap-6 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="edit-saleIdPrefix">
											Transaction ID Prefix
										</Label>
										<Input
											id="edit-saleIdPrefix"
											{...editForm.register("saleIdPrefix")}
											placeholder="e.g. TXN-"
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="edit-digitalSignature">
											Digital Authorization Token (Signature URL)
										</Label>
										<div className="relative">
											<FileSignature className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
											<Input
												id="edit-digitalSignature"
												{...editForm.register("digitalSignature")}
												className="pl-9"
												placeholder="https://"
											/>
										</div>
									</div>

									<div className="space-y-2 md:col-span-2">
										<Label htmlFor="edit-footerNotes">Footer Terms</Label>
										<Textarea
											id="edit-footerNotes"
											rows={4}
											{...editForm.register("footerNotes")}
											placeholder="Write default conditions printed bottom-most inside receipts"
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="subscription" className="space-y-6">
						<Card className="border-neutral-200 dark:border-neutral-800">
							<CardHeader>
								<div className="flex items-center gap-3">
									<Shield className="h-5 w-5 text-primary" />
									<CardTitle>Access plan parameters</CardTitle>
								</div>
								<CardDescription>
									Operational validation metrics linked with active pricing
									tiers.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid gap-6 sm:grid-cols-3">
									<div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
										<span className="text-xs text-neutral-500">
											Tier Profile
										</span>
										<p className="mt-1 text-lg font-bold text-neutral-800 dark:text-neutral-200">
											{account?.pricingPlan?.name || "No Plan Selected"}
										</p>
									</div>

									<div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
										<span className="text-xs text-neutral-500">
											Service Initialization
										</span>
										<p className="mt-1 text-lg font-bold text-neutral-800 dark:text-neutral-200">
											{account?.subsDate
												? new Date(account.subsDate).toLocaleDateString()
												: "—"}
										</p>
									</div>

									<div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
										<span className="text-xs text-neutral-500">
											Expiration Threshold
										</span>
										<p className="mt-1 text-lg font-bold text-neutral-800 dark:text-neutral-200">
											{account?.subsExpiryDate
												? new Date(account.subsExpiryDate).toLocaleDateString()
												: "—"}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				<div className="flex justify-end gap-3 border-t border-neutral-100 pt-6 dark:border-neutral-800">
					<Button
						type="submit"
						disabled={updateAccountMutation.isPending}
						className="flex items-center gap-2 px-6"
					>
						{updateAccountMutation.isPending ? (
							<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
						) : (
							<Save className="h-4 w-4" />
						)}
						Save Changes
					</Button>
				</div>
			</form>
		</div>
	);
}
