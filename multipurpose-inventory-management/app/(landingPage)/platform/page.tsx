"use client";

import {
	ArrowRight,
	BarChart3,
	Cpu,
	Globe2,
	RefreshCw,
	ShieldCheck,
	Zap,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const FEATURES = [
	{
		title: "Real-time Sync",
		description:
			"Inventory levels updated across all channels in milliseconds. No more overselling.",
		icon: RefreshCw,
		color: "text-blue-500",
		bg: "bg-blue-50",
	},
	{
		title: "AI Forecasting",
		description:
			"Predict demand with 98% accuracy using our proprietary machine learning models.",
		icon: BarChart3,
		color: "text-emerald-500",
		bg: "bg-emerald-50",
	},
	{
		title: "Multi-Warehouse",
		description:
			"Manage multiple locations, 3PLs, and retail stores from a single source of truth.",
		icon: Globe2,
		color: "text-purple-500",
		bg: "bg-purple-50",
	},
	{
		title: "Smart Automation",
		description:
			"Automate purchase orders, low-stock alerts, and internal transfers with custom rules.",
		icon: Zap,
		color: "text-amber-500",
		bg: "bg-amber-50",
	},
	{
		title: "Enterprise Security",
		description:
			"Bank-grade encryption, SOC2 compliance, and granular role-based access control.",
		icon: ShieldCheck,
		color: "text-indigo-500",
		bg: "bg-indigo-50",
	},
	{
		title: "API First",
		description:
			"Connect anything with our robust GraphQL API and pre-built webhooks.",
		icon: Cpu,
		color: "text-rose-500",
		bg: "bg-rose-50",
	},
];

export default function PlatformPage() {
	return (
		<div className="min-h-screen bg-slate-50">
			{/* <Header /> */}

			<main>
				{/* Hero Section */}
				<section className="relative overflow-hidden px-4 pt-20 pb-32 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-7xl">
						<div className="text-center">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}
							>
								<span className="inline-flex items-center rounded-full bg-black px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
									The Platform
								</span>
								<h1 className="mt-8 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
									The Operating System for <br />
									<span className="text-slate-500 italic">
										Modern Inventory
									</span>
								</h1>
								<p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-600">
									Sell-Tech Suite provides the infrastructure you need to scale
									your commerce operations. Unified, automated, and built for
									speed.
								</p>
								<div className="mt-10 flex items-center justify-center gap-x-6">
									<Button
										type="button"
										size="lg"
										className="rounded-full px-8 py-6 text-base font-bold shadow-xl transition-all hover:scale-105"
									>
										Get Started Now
									</Button>
									<Link
										href="/features"
										className="text-sm font-bold leading-6 text-slate-900 flex items-center gap-1 group"
									>
										Explore Features{" "}
										<ArrowRight
											size={16}
											className="transition-transform group-hover:translate-x-1"
										/>
									</Link>
								</div>
							</motion.div>
						</div>

						{/* Platform Preview */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.2, duration: 0.8 }}
							className="mt-20 relative mx-auto max-w-5xl rounded-3xl border border-black/5 bg-white p-4 shadow-2xl"
						>
							<div className="aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100 relative">
								<Image
									src="https://picsum.photos/seed/dashboard/1200/675"
									alt="Sell-Tech Suite Dashboard Preview"
									fill
									className="object-cover"
									referrerPolicy="no-referrer"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
							</div>
						</motion.div>
					</div>
				</section>

				{/* Features Grid */}
				<section id="features" className="bg-white py-32 px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-7xl">
						<div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-24">
							<div>
								<h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
									Everything you need to <br />
									manage inventory at scale.
								</h2>
								<p className="mt-6 text-lg leading-8 text-slate-600">
									We&apos;ve built the most comprehensive set of tools for
									modern brands. From small startups to global enterprises,
									Sell-Tech Suite adapts to your workflow.
								</p>
								<div className="mt-10 space-y-8">
									{[
										{
											title: "Unified View",
											desc: "One dashboard for all your warehouses and stores.",
										},
										{
											title: "Smart Routing",
											desc: "Automatically route orders to the nearest fulfillment center.",
										},
										{
											title: "Batch Processing",
											desc: "Update thousands of SKUs in seconds with bulk actions.",
										},
									].map((item) => (
										<div key={item.title} className="flex gap-4">
											<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
												<ShieldCheck size={14} />
											</div>
											<div>
												<h3 className="font-bold text-slate-900">
													{item.title}
												</h3>
												<p className="text-slate-600">{item.desc}</p>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
								{FEATURES.map((feature) => (
									<motion.div
										key={feature.title}
										whileHover={{ y: -5 }}
										className="rounded-3xl border border-slate-100 bg-slate-50/50 p-8 transition-colors hover:border-black/10 hover:bg-white"
									>
										<div
											className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${feature.bg} ${feature.color}`}
										>
											<feature.icon size={24} />
										</div>
										<h3 className="text-lg font-bold text-slate-900">
											{feature.title}
										</h3>
										<p className="mt-2 text-sm leading-relaxed text-slate-500">
											{feature.description}
										</p>
									</motion.div>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* Integration Section */}
				{/* <section className="py-32 px-4 sm:px-6 lg:px-8 bg-slate-50">
					<div className="mx-auto max-w-7xl text-center">
						<h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
							Integrations
						</h2>
						<p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
							Connects with your entire stack.
						</p>
						<div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
							{["Shopify", "Amazon", "Walmart", "Ebay", "Stripe", "FedEx"].map(
								(brand) => (
									<div
										key={brand}
										className="flex h-24 items-center justify-center rounded-2xl bg-white border border-black/5 shadow-sm grayscale transition-all hover:grayscale-0"
									>
										<span className="text-xl font-black text-slate-300">
											{brand}
										</span>
									</div>
								),
							)}
						</div>
					</div>
				</section> */}

				{/* CTA Section */}
				<section className="px-4 py-24 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-black px-8 py-20 text-center text-white shadow-2xl relative">
						<div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
							<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
							<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[120px]" />
						</div>

						<h2 className="relative text-4xl font-bold tracking-tight sm:text-5xl">
							Ready to master your inventory?
						</h2>
						<p className="relative mx-auto mt-6 max-w-xl text-lg text-slate-400">
							Join 10,000+ brands using Sell-Tech Suite to power their global
							operations. Start your 14-day free trial today.
						</p>
						<div className="relative mt-10 flex items-center justify-center gap-4">
							<Button
								type="button"
								variant="secondary"
								size="lg"
								className="rounded-full bg-white text-black hover:bg-slate-100 px-8 py-6 font-bold"
							>
								Start Free Trial
							</Button>
							<Button
								type="button"
								variant="outline"
								size="lg"
								className="rounded-full bg-white/20 border-white/20 text-white hover:bg-white/10 hover:text-white px-8 py-6 font-bold"
							>
								Book a Demo
							</Button>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
