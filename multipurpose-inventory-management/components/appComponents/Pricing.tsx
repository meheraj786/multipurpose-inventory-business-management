"use client";

import { Check, Info, Minus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const PLANS = [
	{
		name: "Starter",
		price: { monthly: 29, yearly: 24 },
		description: "Perfect for side projects and small teams.",
		features: [
			"Basic inventory tracking",
			"2 user seats",
			"Mobile app access",
			"Email support",
		],
		cta: "Get Started",
		popular: false,
	},
	{
		name: "Professional",
		price: { monthly: 79, yearly: 69 },
		description: "The standard for scaling businesses.",
		features: [
			"Advanced analytics & reports",
			"10 user seats",
			"API access",
			"Barcode scanning",
			"Priority 24/7 support",
		],
		cta: "Get Started with Pro",
		popular: true,
	},
	{
		name: "Enterprise",
		price: "Custom",
		description: "Advanced security and dedicated control.",
		features: [
			"Unlimited users",
			"Dedicated account manager",
			"Custom integrations",
			"Single Sign-On (SSO)",
			"SLA guarantees",
		],
		cta: "Contact Sales",
		popular: false,
	},
];

const COMPARISON_FEATURES = [
	{
		name: "Inventory Items",
		info: "Total number of items you can track.",
		starter: "Up to 500",
		pro: "Unlimited",
		enterprise: "Unlimited",
	},
	{
		name: "Multi-warehouse support",
		starter: false,
		pro: true,
		enterprise: true,
	},
	{ name: "Custom Branding", starter: false, pro: false, enterprise: true },
	{ name: "Real-time Sync", starter: "partial", pro: true, enterprise: true },
	{ name: "AI Forecasting", starter: false, pro: true, enterprise: true },
];

export function Pricing() {
	const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
		"monthly",
	);

	return (
		<section className="bg-[#F9FAFB] py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				{/* Header */}
				<div className="mx-auto max-w-4xl text-center mb-8">
					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl mb-6"
					>
						Plans for every stage of growth
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="text-lg leading-8 text-slate-500 max-w-2xl mx-auto"
					>
						Scale your inventory operations with confidence. Start free, then
						add more features as you grow.
					</motion.p>
				</div>

				{/* Toggle */}
				<div className="flex flex-col items-center mb-16">
					<div className="relative flex w-64 items-center rounded-full bg-slate-100 p-1">
						<motion.div
							className="absolute h-9 w-[124px] rounded-full bg-white shadow-sm"
							animate={{ x: billingCycle === "monthly" ? 0 : 128 }}
							transition={{ type: "spring", stiffness: 300, damping: 30 }}
						/>
						<button
							type="button"
							onClick={() => setBillingCycle("monthly")}
							className={`relative z-10 w-1/2 py-2 text-sm font-bold transition-colors ${billingCycle === "monthly" ? "text-slate-900" : "text-slate-500"}`}
						>
							Monthly
						</button>
						<button
							type="button"
							onClick={() => setBillingCycle("yearly")}
							className={`relative z-10 w-1/2 py-2 text-sm font-bold transition-colors ${billingCycle === "yearly" ? "text-slate-900" : "text-slate-500"}`}
						>
							Yearly
						</button>
					</div>
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="mt-4 flex items-center gap-2"
					>
						<span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
							Save 20% with yearly
						</span>
					</motion.div>
				</div>

				{/* Cards */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-32">
					{PLANS.map((plan, index) => (
						<motion.div
							key={plan.name}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 + 0.2 }}
							className={`relative flex flex-col bg-white rounded-[32px] p-8 shadow-sm border ${plan.popular ? "border-black ring-1 ring-black scale-105 z-10" : "border-slate-100"}`}
						>
							{plan.popular && (
								<div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-black px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
									Most Popular
								</div>
							)}

							<div className="mb-8">
								<h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
									{plan.name}
								</h3>
								<div className="flex items-baseline gap-1">
									<span className="text-5xl font-bold text-slate-900">
										{typeof plan.price === "string"
											? plan.price
											: `$${plan.price[billingCycle]}`}
									</span>
									{typeof plan.price !== "string" && (
										<span className="text-slate-500 font-medium">/mo</span>
									)}
								</div>
								<p className="mt-4 text-sm text-slate-500 leading-relaxed">
									{plan.description}
								</p>
							</div>

							<button
								type="button"
								className={`w-full rounded-2xl py-4 text-sm font-bold transition-all duration-200 mb-8 ${plan.popular ? "bg-black text-white hover:bg-slate-800 shadow-lg shadow-black/10" : "bg-white text-slate-900 border border-slate-200 hover:border-slate-900"}`}
							>
								{plan.cta}
							</button>

							<ul className="space-y-4 flex-grow">
								{plan.features.map((feature) => (
									<li
										key={feature}
										className="flex items-start gap-3 text-sm text-slate-600"
									>
										<Check className="h-5 w-5 text-emerald-500 shrink-0" />
										{feature}
									</li>
								))}
							</ul>
						</motion.div>
					))}
				</div>

				{/* Comparison Table */}
				<div className="mx-auto max-w-5xl">
					<h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
						Compare features
					</h2>
					<div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="border-b border-slate-50">
									<th className="py-6 px-8 text-xs font-bold uppercase tracking-widest text-slate-400">
										Features
									</th>
									<th className="py-6 px-8 text-center text-sm font-bold text-slate-900">
										Starter
									</th>
									<th className="py-6 px-8 text-center text-sm font-bold text-slate-900 bg-slate-50/50">
										Pro
									</th>
									<th className="py-6 px-8 text-center text-sm font-bold text-slate-900">
										Enterprise
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-50">
								{COMPARISON_FEATURES.map((feature) => (
									<tr
										key={feature.name}
										className="group hover:bg-slate-50/30 transition-colors"
									>
										<td className="py-6 px-8">
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium text-slate-700">
													{feature.name}
												</span>
												{feature.info && (
													<div className="group/info relative">
														<Info className="h-4 w-4 text-slate-300 cursor-help" />
														<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-lg bg-slate-900 p-2 text-[10px] text-white opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-20">
															{feature.info}
														</div>
													</div>
												)}
											</div>
										</td>
										<td className="py-6 px-8 text-center">
											{renderCell(feature.starter)}
										</td>
										<td className="py-6 px-8 text-center bg-slate-50/50">
											{renderCell(feature.pro)}
										</td>
										<td className="py-6 px-8 text-center">
											{renderCell(feature.enterprise)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</section>
	);
}

function renderCell(value: string | boolean | "partial") {
	if (value === true)
		return <Check className="mx-auto h-5 w-5 text-slate-900" />;
	if (value === false)
		return <Minus className="mx-auto h-5 w-5 text-slate-200" />;
	if (value === "partial")
		return <Check className="mx-auto h-5 w-5 text-slate-300" />;
	return <span className="text-sm font-medium text-slate-500">{value}</span>;
}
