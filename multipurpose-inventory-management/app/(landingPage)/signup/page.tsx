"use client";

import {
	ArrowLeft,
	ArrowRight,
	Check,
	CheckCircle2,
	ChevronDown,
	Eye,
	EyeOff,
	// Globe,
	Lock,
	Mail,
	Package,
	Store,
	// Upload,
	Users,
	Utensils,
	Zap,
	// CircleDollarSign,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { RegisterInput } from "@/validation/auth.schema";

type Step = 1 | 2 | 3;

const BUSINESS_MODELS = [
	{
		id: "RETAIL",
		label: "Retail Business",
		icon: Store,
		desc: "Selling physical goods",
	},
	{
		id: "SERVICE",
		label: "Service Provider",
		icon: Users,
		desc: "Consulting, repairs, etc.",
	},
	{
		id: "RESTAURANT",
		label: "Restaurant",
		icon: Utensils,
		desc: "Food and dining services",
	},
	{
		id: "RETAIL_AND_SERVICE",
		label: "Retail & Service",
		icon: Package,
		desc: "Mixed operations",
	},
	{
		id: "SERVICE_AND_RESTAURANT",
		label: "Service & Food",
		icon: Zap,
		desc: "Services + Dining",
	},
	{
		id: "RETAIL_AND_RESTAURANT",
		label: "Retail & Food",
		icon: Utensils,
		desc: "Shop + Dining",
	},
	{
		id: "RETAIL_AND_SERVICE_AND_RESTAURANT",
		label: "Hybrid (All)",
		icon: Zap,
		desc: "Full scale operations",
	},
] as const;

const Breadcrumbs = ({ currentStep }: { currentStep: number }) => {
	const steps = [
		{ id: 1, label: "Credentials" },
		{ id: 2, label: "Business Details" },
		{ id: 3, label: "Confirmation" },
	];

	return (
		<nav className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400 mb-8">
			{steps.map((s, idx) => (
				<React.Fragment key={s.id}>
					<span
						className={cn(
							"transition-colors",
							s.id === currentStep ? "text-slate-900 font-bold" : "opacity-50",
						)}
					>
						{s.label}
					</span>
					{idx < steps.length - 1 && (
						<ChevronDown size={12} className="-rotate-90 opacity-30" />
					)}
				</React.Fragment>
			))}
		</nav>
	);
};

export default function SignupPage() {
	const [step, setStep] = React.useState<Step>(1);
	const [showPassword, setShowPassword] = React.useState(false);

	const [formData, setFormData] = React.useState<
		RegisterInput & { confirmPassword: string }
	>({
		email: "",
		password: "",
		confirmPassword: "",
		companyName: "",
		category: "",
		type: "",
		model: "RETAIL",
		currency: "BDT",
		pricingPlanId: "f9bffc6d-1285-4087-8671-6dc6f2b9c562",
	});

	const { mutate: register, isPending } = useRegister();

	const handleNext = () => {
		if (step === 1) {
			if (!formData.email || !formData.password)
				return toast.error("Please fill all fields");
			if (formData.password !== formData.confirmPassword)
				return toast.error("Passwords do not match");
			if (formData.password.length < 6)
				return toast.error("Password too short");
			setStep(2);
		}
	};

	const handleSubmit = () => {
		if (!formData.companyName || !formData.category || !formData.type) {
			return toast.error("Please complete company details");
		}

		const { ...submitData } = formData;

		register(submitData, {
			onSuccess: () => setStep(3),
			onError: (_error) => toast.error("Registration failed"),
		});
	};

	return (
		<main className="min-h-screen bg-[#F9FAFB] flex flex-col">
			<div className="flex-1 flex items-center justify-center p-4 sm:p-8">
				<div className="w-full max-w-4xl">
					<AnimatePresence mode="wait">
						{/* STEP 1: ACCOUNT DETAILS */}
						{step === 1 && (
							<motion.div
								key="step1"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								className="max-w-md mx-auto"
							>
								<Breadcrumbs currentStep={1} />
								<div className="text-center mb-8">
									<h1 className="text-3xl font-bold text-slate-900">
										Create Account
									</h1>
									<p className="text-slate-500">
										Start your 14-day free trial today.
									</p>
								</div>

								<div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-5">
									<div className="space-y-2">
										<Label htmlFor="email">Email Address</Label>
										<div className="relative">
											<Mail
												className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
												size={18}
											/>
											<Input
												id="email"
												type="email"
												placeholder="name@company.com"
												value={formData.email}
												onChange={(e) =>
													setFormData({ ...formData, email: e.target.value })
												}
												className="pl-10 h-12 rounded-xl"
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="password">Password</Label>
										<div className="relative">
											<Lock
												className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
												size={18}
											/>
											<Input
												id="password"
												type={showPassword ? "text" : "password"}
												value={formData.password}
												onChange={(e) =>
													setFormData({ ...formData, password: e.target.value })
												}
												className="pl-10 pr-10 h-12 rounded-xl"
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
											>
												{showPassword ? (
													<EyeOff size={18} />
												) : (
													<Eye size={18} />
												)}
											</button>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="confirmPassword">Confirm Password</Label>
										<div className="relative">
											<Lock
												className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
												size={18}
											/>
											<Input
												id="confirmPassword"
												type={showPassword ? "text" : "password"}
												value={formData.confirmPassword}
												onChange={(e) =>
													setFormData({
														...formData,
														confirmPassword: e.target.value,
													})
												}
												className="pl-10 h-12 rounded-xl"
											/>
										</div>
									</div>

									<Button
										onClick={handleNext}
										className="w-full h-12 rounded-xl bg-black hover:bg-slate-800"
									>
										Continue <ArrowRight className="ml-2" size={18} />
									</Button>
								</div>
							</motion.div>
						)}

						{/* STEP 2: COMPANY DETAILS */}
						{step === 2 && (
							<motion.div
								key="step2"
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
							>
								<Breadcrumbs currentStep={2} />
								<div className="mb-8 text-center">
									<h1 className="text-3xl font-bold text-slate-900">
										Setup Business
									</h1>
									<p className="text-slate-500">
										Tell us about your company operations.
									</p>
								</div>

								<div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
										<div className="space-y-4">
											<div className="space-y-2">
												<Label>Company Name</Label>
												<Input
													placeholder="Global Traders Inc."
													value={formData.companyName}
													onChange={(e) =>
														setFormData({
															...formData,
															companyName: e.target.value,
														})
													}
													className="h-12 rounded-xl"
												/>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label>Category</Label>
													<select
														className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white"
														value={formData.category}
														onChange={(e) =>
															setFormData({
																...formData,
																category: e.target.value,
															})
														}
													>
														<option value="">Select...</option>
														<option value="Retail">Retail</option>
														<option value="Manufacturing">Manufacturing</option>
														<option value="Tech">Technology</option>
													</select>
												</div>
												<div className="space-y-2">
													<Label>Currency</Label>
													<select
														className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white"
														value={formData.currency}
														onChange={(e) =>
															setFormData({
																...formData,
																currency: e.target.value as
																	| "USD"
																	| "BDT"
																	| "EUR"
																	| "GBP",
															})
														}
													>
														<option value="BDT">BDT (৳)</option>
														<option value="USD">USD ($)</option>
														<option value="EUR">EUR (€)</option>
														<option value="GBP">GBP (£)</option>
													</select>
												</div>
											</div>
										</div>

										<div className="space-y-2">
											<Label>Company Type</Label>
											<select
												className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white"
												value={formData.type}
												onChange={(e) =>
													setFormData({ ...formData, type: e.target.value })
												}
											>
												<option value="">Select...</option>
												<option value="Private">Private Limited</option>
												<option value="Public">Public Company</option>
												<option value="Sole">Sole Proprietorship</option>
											</select>
										</div>
									</div>

									<div className="space-y-4">
										<Label className="text-xs font-bold uppercase tracking-widest text-slate-400">
											Business Model
										</Label>
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
											{BUSINESS_MODELS.map((m) => (
												<button
													key={m.id}
													type="button"
													onClick={() =>
														setFormData({ ...formData, model: m.id })
													}
													className={cn(
														"p-4 rounded-2xl border text-left transition-all relative group",
														formData.model === m.id
															? "border-black bg-black text-white"
															: "border-slate-200 hover:border-slate-300",
													)}
												>
													<m.icon
														size={20}
														className={cn(
															"mb-2",
															formData.model === m.id
																? "text-white"
																: "text-slate-400",
														)}
													/>
													<p className="text-sm font-bold block">{m.label}</p>
													<p
														className={cn(
															"text-[10px]",
															formData.model === m.id
																? "text-slate-300"
																: "text-slate-400",
														)}
													>
														{m.desc}
													</p>
													{formData.model === m.id && (
														<CheckCircle2
															size={16}
															className="absolute top-3 right-3"
														/>
													)}
												</button>
											))}
										</div>
									</div>

									<div className="mt-10 pt-6 border-t flex justify-between items-center">
										<button
											type="button"
											onClick={() => setStep(1)}
											className="text-slate-400 hover:text-slate-600 flex items-center gap-2 text-sm font-medium"
										>
											<ArrowLeft size={16} /> Back
										</button>
										<Button
											onClick={handleSubmit}
											disabled={isPending}
											className="h-12 px-10 rounded-xl bg-black hover:bg-slate-800"
										>
											{isPending ? "Creating Account..." : "Create My Account"}
										</Button>
									</div>
								</div>
							</motion.div>
						)}

						{/* STEP 3: SUCCESS */}
						{step === 3 && (
							<motion.div
								key="step3"
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								className="max-w-md mx-auto text-center"
							>
								<div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm flex flex-col items-center">
									<div className="h-20 w-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
										<Check size={40} />
									</div>
									<h1 className="text-3xl font-bold text-slate-900 mb-2">
										Welcome Aboard!
									</h1>
									<p className="text-slate-500 mb-8">
										Your account for{" "}
										<span className="font-bold text-slate-900">
											{formData.companyName}
										</span>{" "}
										has been created successfully.
									</p>
									<Link href="/login" className="w-full">
										<Button className="w-full h-12 rounded-xl bg-black">
											Go to Login
										</Button>
									</Link>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</main>
	);
}
