"use client";

import { format } from "date-fns";
import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	CheckCircle,
	Layers,
	Mail,
	MapPin,
	Package,
	Phone,
	Receipt,
	ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useCurrency } from "@/hooks/useCurrency";
import { useGetCustomer } from "@/hooks/useCustomer";
import type { Sale, SaleItem, SaleServiceItem } from "@/hooks/useSale";
import { cn } from "@/lib/utils";

interface PaymentRecord {
	method: string;
	amount: number;
	transactionId?: string;
}

export default function CustomerDetailPage() {
	const { id } = useParams() as { id: string };
	const { data: customer, isLoading } = useGetCustomer(id);
	const { symbol } = useCurrency();

	if (isLoading) return <CustomerSkeleton />;
	if (!customer) {
		return (
			<div className="container mx-auto p-6 text-center py-20 space-y-4">
				<p className="text-muted-foreground">Customer profile not found.</p>
				<Button asChild variant="outline">
					<Link href="/dashboard/customers">Back to Customers</Link>
				</Button>
			</div>
		);
	}

	const sales = customer.sales || [];
	const totalSales = sales.length;

	// Calculate Outstanding Due
	const totalDue = sales.reduce(
		(acc: number, sale: Sale) => acc + Number(sale.due || 0),
		0,
	);

	// Calculate Cumulative Spend (Accurately handles item discounts, service subtotals, and global discounts)
	const totalSpent = sales.reduce((acc: number, sale: Sale) => {
		const itemsTotal =
			sale.saleItems?.reduce(
				(s: number, i: SaleItem) =>
					s +
					(Number(i.sellPrice || 0) * Number(i.quantity || 0) -
						Number(i.discount || 0)),
				0,
			) || 0;

		const serviceTotal =
			sale.saleServices?.reduce(
				(s: number, i: SaleServiceItem) => s + Number(i.total || 0),
				0,
			) || 0;

		const grandTotal = Math.max(
			0,
			itemsTotal + serviceTotal - Number(sale.discount || 0),
		);
		return acc + grandTotal;
	}, 0);

	return (
		<div className="p-6 space-y-6 max-w-7xl mx-auto">
			{/* Top Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" asChild>
						<Link href="/dashboard/customers">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-2xl font-bold tracking-tight">
								{customer.name}
							</h1>
							{customer.hasMembership ? (
								<Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200">
									Premium Member
								</Badge>
							) : (
								<Badge variant="secondary" className="text-muted-foreground">
									Standard Tier
								</Badge>
							)}
						</div>
						<p className="text-xs font-mono text-muted-foreground mt-0.5">
							ID: {customer.id}
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm">
						Edit Profile
					</Button>
					<Button size="sm" asChild>
						<Link href="/dashboard/sales">Create New Sale</Link>
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="border shadow-sm">
					<CardContent className="pt-6 flex items-center gap-4">
						<div className="p-3 bg-primary/10 text-primary rounded-full">
							<Receipt className="h-6 w-6" />
						</div>
						<div>
							<p className="text-xs font-medium text-muted-foreground">
								Lifetime Value
							</p>
							<p className="text-2xl font-bold">
								{symbol}
								{totalSpent.toLocaleString(undefined, {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</p>
						</div>
					</CardContent>
				</Card>

				<Card
					className={cn(
						"border shadow-sm",
						totalDue > 0 ? "bg-red-50/50 border-red-200" : "",
					)}
				>
					<CardContent className="pt-6 flex items-center gap-4">
						<div
							className={cn(
								"p-3 rounded-full",
								totalDue > 0
									? "bg-red-100 text-red-600"
									: "bg-muted text-muted-foreground",
							)}
						>
							<AlertCircle className="h-6 w-6" />
						</div>
						<div>
							<p className="text-xs font-medium text-muted-foreground">
								Outstanding Balance
							</p>
							<p
								className={cn(
									"text-2xl font-bold",
									totalDue > 0 ? "text-red-600" : "text-muted-foreground",
								)}
							>
								{symbol}
								{totalDue.toLocaleString(undefined, {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="border shadow-sm">
					<CardContent className="pt-6 flex items-center gap-4">
						<div className="p-3 bg-blue-50 text-blue-600 rounded-full">
							<Calendar className="h-6 w-6" />
						</div>
						<div>
							<p className="text-xs font-medium text-muted-foreground">
								Total Visits
							</p>
							<p className="text-2xl font-bold">{totalSales} Orders</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Contact Info Card */}
				<Card className="lg:col-span-1 border shadow-sm">
					<CardHeader>
						<CardTitle className="text-sm font-semibold">
							Contact & Profile
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm">
						<div className="flex items-center gap-3">
							<Phone className="h-4 w-4 text-muted-foreground" />
							<span className="font-medium text-foreground">
								{customer.phone}
							</span>
						</div>
						<div className="flex items-center gap-3">
							<Mail className="h-4 w-4 text-muted-foreground" />
							<span
								className="font-medium text-foreground truncate"
								title={customer.email || undefined}
							>
								{customer.email || (
									<span className="text-muted-foreground italic">
										No email saved
									</span>
								)}
							</span>
						</div>
						<div className="flex items-start gap-3">
							<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
							<span className="font-medium text-foreground text-xs leading-relaxed">
								{customer.address || (
									<span className="text-muted-foreground italic">
										No address saved
									</span>
								)}
							</span>
						</div>
						<div className="pt-4 border-t space-y-2">
							<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
								Customer Since
							</p>
							<p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
								<Calendar className="h-4 w-4 text-primary" />
								{format(new Date(customer.createdAt), "PPP")}
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Detailed Purchase History Table */}
				<Card className="lg:col-span-2 border shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-sm font-semibold">
							Sales Ledger & History
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="border rounded-lg overflow-hidden">
							<Table>
								<TableHeader className="bg-muted/40">
									<TableRow>
										<TableHead className="h-10">Order & Date</TableHead>
										<TableHead className="h-10">Items Purchased</TableHead>
										<TableHead className="h-10">Payment Detail</TableHead>
										<TableHead className="h-10 text-right">
											Balance Due
										</TableHead>
										<TableHead className="h-10 text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{sales.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={5}
												className="text-center py-12 text-muted-foreground"
											>
												No transaction records exist for this customer.
											</TableCell>
										</TableRow>
									) : (
										sales.map((sale: Sale) => {
											// Dynamic total recalculations (deducting discounts)
											const itemValue =
												sale.saleItems?.reduce((sum: number, i: SaleItem) => {
													return (
														sum +
														(Number(i.sellPrice) * Number(i.quantity) -
															Number(i.discount || 0))
													);
												}, 0) || 0;
											const serviceValue =
												sale.saleServices?.reduce(
													(sum: number, s: SaleServiceItem) => {
														return sum + Number(s.total || 0);
													},
													0,
												) || 0;

											const grandTotal = Math.max(
												0,
												itemValue + serviceValue - Number(sale.discount || 0),
											);
											const totalItemCount =
												(sale.saleItems?.length || 0) +
												(sale.saleServices?.length || 0);

											// Check for multi-method details
											let structuredPayments: PaymentRecord[] = [];
											if (sale.payments) {
												try {
													structuredPayments =
														typeof sale.payments === "string"
															? JSON.parse(sale.payments)
															: (sale.payments as unknown as PaymentRecord[]);
												} catch (_e) {
													structuredPayments = [];
												}
											}

											return (
												<TableRow key={sale.id} className="hover:bg-muted/5">
													<TableCell className="py-3">
														<div className="font-semibold text-foreground text-sm">
															{format(new Date(sale.createdAt), "dd MMM, yyyy")}
														</div>
														<div className="text-[10px] text-muted-foreground font-mono mt-0.5">
															REF: {sale.id.slice(0, 13).toUpperCase()}
														</div>
													</TableCell>
													<TableCell className="py-3">
														<div className="flex flex-col gap-1">
															<span className="text-xs font-semibold flex items-center gap-1">
																<ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
																{totalItemCount}{" "}
																{totalItemCount === 1
																	? "Line Item"
																	: "Line Items"}
															</span>
															{/* Summarized visual sub-items badges */}
															<div className="flex gap-1 flex-wrap">
																{sale.saleItems &&
																	sale.saleItems.length > 0 && (
																		<Badge
																			variant="outline"
																			className="h-4 px-1 text-[8px] tracking-wide uppercase font-mono"
																		>
																			<Package className="h-2 w-2 mr-0.5 text-muted-foreground" />
																			Products ({sale.saleItems.length})
																		</Badge>
																	)}
																{sale.saleServices &&
																	sale.saleServices.length > 0 && (
																		<Badge
																			variant="outline"
																			className="h-4 px-1 text-[8px] tracking-wide uppercase font-mono"
																		>
																			<Layers className="h-2 w-2 mr-0.5 text-muted-foreground" />
																			Services ({sale.saleServices.length})
																		</Badge>
																	)}
															</div>
														</div>
													</TableCell>
													<TableCell className="py-3">
														<div className="flex flex-col gap-1">
															<Badge
																variant="outline"
																className="w-fit text-[9px] uppercase tracking-wider bg-primary/5 text-primary border-primary/10"
															>
																{sale.paymentMethod.replace(/_/g, " ")}
															</Badge>
															{/* Multi payment indicator */}
															{structuredPayments.length > 0 && (
																<span className="text-[9px] text-muted-foreground">
																	Split across {structuredPayments.length}{" "}
																	methods
																</span>
															)}
														</div>
													</TableCell>
													<TableCell className="py-3 text-right">
														{Number(sale.due) > 0 ? (
															<div className="flex flex-col items-end">
																<span className="text-red-600 font-bold font-mono text-sm">
																	{symbol}
																	{Number(sale.due).toFixed(2)}
																</span>
																<span className="text-[10px] text-muted-foreground font-medium">
																	Of {symbol}
																	{grandTotal.toFixed(2)} Total
																</span>
															</div>
														) : (
															<span className="text-emerald-600 font-medium text-xs inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5">
																<CheckCircle className="h-3 w-3" /> Fully Paid
															</span>
														)}
													</TableCell>
													<TableCell className="py-3 text-right">
														<Button
															variant="outline"
															size="sm"
															className="h-8 text-xs"
															asChild
														>
															<Link href={`/dashboard/sales/${sale.id}`}>
																View Receipt
															</Link>
														</Button>
													</TableCell>
												</TableRow>
											);
										})
									)}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function CustomerSkeleton() {
	return (
		<div className="p-6 space-y-6 max-w-7xl mx-auto">
			<div className="flex justify-between items-center">
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-10 w-44" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-24 w-full" />
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<Skeleton className="h-80 col-span-1" />
				<Skeleton className="h-80 col-span-2" />
			</div>
		</div>
	);
}
