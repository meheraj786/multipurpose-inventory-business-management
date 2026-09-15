"use client";

import { BarChart3, Check, Layout, PieChart, Zap } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const FEATURES = [
	{
		id: "inventory-tracking",
		tag: "INVENTORY CONTROL",
		title: "Advanced Inventory Tracking",
		description:
			"Monitor stock levels across multiple locations in real-time. Our system handles SKU variations, serial numbers, and batch tracking with surgical precision.",
		points: [
			"Multi-warehouse synchronization and transfer logs.",
			"Real-time alerts for low stock and expiring batches.",
		],
		image: "https://picsum.photos/seed/dashboard/800/600",
		reversed: false,
	},
	{
		id: "unified-commerce",
		tag: "UNIFIED COMMERCE",
		title: "Unified Retail & Service Sale",
		description:
			"Why use two systems when you only need one? Seamlessly bundle physical products with service-based labor in a single transaction. Perfect for repair shops, consultants, and technical retailers.",
		subFeatures: [
			{
				title: "Bundled POS",
				description: "Combine labor hours and hardware parts on one invoice.",
				icon: Layout,
			},
			{
				title: "Tax Automation",
				description:
					"Different tax rules for products vs services applied instantly.",
				icon: Zap,
			},
		],
		image: "https://picsum.photos/seed/checkout/800/600",
		reversed: true,
	},
	{
		id: "smart-procurement",
		tag: "SUPPLY CHAIN",
		title: "Smart Procurement",
		description:
			"Eliminate stockouts and overstocking. Our intelligent procurement engine suggests restock quantities based on seasonal trends, lead times, and current velocity.",
		numberedPoints: [
			{
				number: "1",
				title: "Auto-Generated POs",
				description:
					"Purchase orders created as soon as stock hits reorder points.",
			},
			{
				number: "2",
				title: "Vendor Performance",
				description: "Track delivery speed and accuracy for every supplier.",
			},
		],
		image: "https://picsum.photos/seed/procurement/800/600",
		reversed: false,
	},
	{
		id: "analytics-reporting",
		tag: "INTELLIGENCE",
		title: "Analytics & Reporting",
		description:
			"Transform raw data into strategic insights. Visualize your sell-through rates, profit margins, and dead stock reports through customizable dashboards built for executives and managers alike.",
		subFeatures: [
			{
				title: "Automated Insights",
				description:
					"Weekly reports delivered to your inbox with key performance indicators and action items.",
				icon: BarChart3,
			},
			{
				title: "Dead Stock Identification",
				description:
					"Instantly flag items that haven't moved in 90+ days to free up capital and warehouse space.",
				icon: PieChart,
			},
		],
		image: "https://picsum.photos/seed/analytics/800/600",
		reversed: true,
	},
];

export default function FeaturesPage() {
	return (
		<div className="min-h-screen bg-white font-sans">
			<main>
				{/* Hero Section */}
				<section className="px-4 pt-20 pb-24 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-7xl text-center">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-7xl">
								Powerful features for{" "}
								<span className="text-slate-400">modern commerce.</span>
							</h1>
							<p className="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-slate-600">
								Deep dive into the tools designed to scale your business. From
								granular inventory control to predictive analytics, Sell-Tech
								Suite puts you in command.
							</p>
						</motion.div>
					</div>
				</section>

				{/* Features Sections */}
				{FEATURES.map((feature, index) => (
					<section
						key={feature.id}
						className={`px-4 py-24 sm:px-6 lg:px-8 ${index % 2 === 1 ? "bg-slate-50" : "bg-white"}`}
					>
						<div className="mx-auto max-w-7xl">
							<div
								className={`flex flex-col items-center gap-16 lg:flex-row ${feature.reversed ? "lg:flex-row-reverse" : ""}`}
							>
								{/* Text Content */}
								<div className="flex-1">
									<motion.div
										initial={{ opacity: 0, x: feature.reversed ? 20 : -20 }}
										whileInView={{ opacity: 1, x: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.6 }}
									>
										<div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1 text-xs font-bold tracking-widest text-slate-900">
											<div className="mr-2 h-1.5 w-1.5 rounded-full bg-black" />
											{feature.tag}
										</div>
										<h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
											{feature.title}
										</h2>
										<p className="mt-6 text-lg leading-relaxed text-slate-600">
											{feature.description}
										</p>

										{/* Feature-specific lists/subfeatures */}
										{feature.points && (
											<ul className="mt-8 space-y-4">
												{feature.points.map((point) => (
													<li key={point} className="flex items-start gap-3">
														<div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-900">
															<Check size={12} strokeWidth={3} />
														</div>
														<span className="text-slate-600">{point}</span>
													</li>
												))}
											</ul>
										)}

										{feature.subFeatures && (
											<div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
												{feature.subFeatures.map((sub) => (
													<div key={sub.title}>
														<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
															<sub.icon size={20} />
														</div>
														<h4 className="mt-4 font-bold text-slate-900">
															{sub.title}
														</h4>
														<p className="mt-2 text-sm text-slate-500">
															{sub.description}
														</p>
													</div>
												))}
											</div>
										)}

										{feature.numberedPoints && (
											<div className="mt-10 space-y-6">
												{feature.numberedPoints.map((point) => (
													<div
														key={point.title}
														className="flex gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-100"
													>
														<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
															{point.number}
														</div>
														<div>
															<h4 className="font-bold text-slate-900">
																{point.title}
															</h4>
															<p className="mt-1 text-sm text-slate-500">
																{point.description}
															</p>
														</div>
													</div>
												))}
											</div>
										)}
									</motion.div>
								</div>

								{/* Image/Mockup */}
								<div className="flex-1">
									<motion.div
										initial={{ opacity: 0, scale: 0.95 }}
										whileInView={{ opacity: 1, scale: 1 }}
										viewport={{ once: true }}
										transition={{ duration: 0.6 }}
										className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-2xl"
									>
										<Image
											src={feature.image}
											alt={feature.title}
											fill
											className="object-cover"
											referrerPolicy="no-referrer"
										/>
										{/* Mockup Overlay Elements */}
										<div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none" />
									</motion.div>
								</div>
							</div>
						</div>
					</section>
				))}

				{/* Final CTA Section */}
				<section className="px-4 py-24 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-7xl text-center">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className="rounded-[3rem] bg-black px-8 py-20 text-white sm:px-16 sm:py-32"
						>
							<h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
								Ready to master your stock?
							</h2>
							<p className="mx-auto mt-8 max-w-2xl text-lg text-slate-400">
								Join thousands of businesses that have scaled their operations
								with Sell-Tech Suite&apos;s comprehensive toolset.
							</p>
							<div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
								<Button
									type="button"
									size="lg"
									className="h-16 w-full rounded-full bg-white px-10 text-lg font-bold text-black hover:bg-slate-100 sm:w-auto transition-all active:scale-95"
								>
									Start Free Trial
								</Button>
								<Button
									type="button"
									variant="outline"
									size="lg"
									className="h-16 w-full rounded-full border-white/20 bg-transparent px-10 text-lg font-bold text-white hover:bg-white/10 sm:w-auto transition-all active:scale-95"
								>
									Request a Demo
								</Button>
							</div>
						</motion.div>
					</div>
				</section>
			</main>
		</div>
	);
}
