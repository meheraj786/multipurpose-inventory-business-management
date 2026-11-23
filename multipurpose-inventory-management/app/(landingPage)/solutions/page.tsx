"use client";

import { CheckCircle2, Factory, ShoppingBag, Store, Truck } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const SOLUTIONS = [
	{
		id: "ecommerce",
		title: "E-commerce & D2C",
		subtitle: "Scale your online brand without the inventory headaches.",
		description:
			"Connect your Shopify, Amazon, and other storefronts. Manage orders, track stock levels in real-time, and automate fulfillment across multiple 3PLs.",
		features: ["Omnichannel Sync", "Bundle Management", "Returns Automation"],
		icon: ShoppingBag,
		image: "https://picsum.photos/seed/ecommerce/800/600",
		color: "bg-blue-600",
	},
	{
		id: "manufacturing",
		title: "Manufacturing",
		subtitle: "Raw materials to finished goods, tracked perfectly.",
		description:
			"Manage Bill of Materials (BOM), track production stages, and ensure you always have the components needed to keep the line moving.",
		features: ["BOM Management", "Production Tracking", "Raw Material Alerts"],
		icon: Factory,
		image: "https://picsum.photos/seed/factory/800/600",
		color: "bg-emerald-600",
	},
	{
		id: "retail",
		title: "Modern Retail",
		subtitle: "Bridge the gap between online and offline.",
		description:
			"Unified inventory for your brick-and-mortar stores and online shop. Enable BOPIS (Buy Online, Pick Up In Store) and ship-from-store with ease.",
		features: ["POS Integration", "Local Inventory Ads", "Store Transfers"],
		icon: Store,
		image: "https://picsum.photos/seed/retail/800/600",
		color: "bg-purple-600",
	},
	{
		id: "logistics",
		title: "Logistics & 3PL",
		subtitle: "The backbone for your fulfillment operations.",
		description:
			"Powerful tools for warehouse management, pick-and-pack optimization, and carrier integrations. Provide your clients with real-time visibility.",
		features: ["WMS Capabilities", "Carrier Rates", "Client Portals"],
		icon: Truck,
		image: "https://picsum.photos/seed/logistics/800/600",
		color: "bg-amber-600",
	},
];

export default function SolutionsPage() {
	return (
		<div className="min-h-screen bg-white">
			<main>
				{/* Hero Section */}
				<section className="bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-7xl text-center">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
						>
							<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
								Solutions for{" "}
								<span className="text-[#90A1B9]">Every Industry</span>
							</h1>
							<p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
								Whether you&apos;re selling direct-to-consumer or managing
								complex manufacturing lines, Sell-Tech Suite has the tools to
								help you succeed.
							</p>
						</motion.div>
					</div>
				</section>

				{/* Industry Solutions */}
				<section className="py-24">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="space-y-32">
							{SOLUTIONS.map((solution, idx) => (
								<div
									key={solution.id}
									className={`flex flex-col gap-16 lg:items-center ${idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
								>
									<div className="flex-1">
										<div
											className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${solution.color} text-white shadow-lg`}
										>
											<solution.icon size={28} />
										</div>
										<h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
											{solution.title}
										</h2>
										<p className="mt-4 text-xl font-medium text-slate-500 italic">
											{solution.subtitle}
										</p>
										<p className="mt-6 text-lg leading-relaxed text-slate-600">
											{solution.description}
										</p>
										<ul className="mt-8 space-y-4">
											{solution.features.map((feature) => (
												<li
													key={feature}
													className="flex items-center gap-3 text-slate-700 font-medium"
												>
													<CheckCircle2
														size={20}
														className="text-emerald-500"
													/>
													{feature}
												</li>
											))}
										</ul>
										<div className="mt-10">
											<Button
												type="button"
												size="lg"
												className="rounded-full px-8 font-bold"
											>
												Learn More
											</Button>
										</div>
									</div>

									<div className="flex-1 relative">
										<motion.div
											whileHover={{ scale: 1.02 }}
											transition={{ duration: 0.4 }}
											className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] shadow-2xl border border-black/5"
										>
											<Image
												src={solution.image}
												alt={solution.title}
												fill
												className="object-cover"
												referrerPolicy="no-referrer"
											/>
										</motion.div>
										{/* Decorative element */}
										<div
											className={`absolute -z-10 -bottom-6 -right-6 h-full w-full rounded-[2.5rem] opacity-10 ${solution.color}`}
										/>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Testimonial Section */}
				<section className="bg-slate-900 py-32 text-white overflow-hidden relative">
					<div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
						<div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-blue-500 rounded-full blur-[100px]" />
						<div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-500 rounded-full blur-[100px]" />
					</div>

					<div className="mx-auto max-w-4xl px-4 text-center relative">
						<div className="mb-12 flex justify-center">
							<div className="flex gap-1">
								{[1, 2, 3, 4, 5].map((s) => (
									<span key={s} className="text-amber-400">
										★
									</span>
								))}
							</div>
						</div>
						<blockquote className="text-3xl font-medium leading-snug sm:text-4xl">
							&quot;Sell-Tech Suite transformed our logistics. We went from
							manual spreadsheets to a fully automated system in less than a
							month. Our fulfillment speed increased by 40%.&quot;
						</blockquote>
						<div className="mt-12">
							<div className="mx-auto h-16 w-16 overflow-hidden rounded-full border-2 border-white/20">
								<Image
									src="https://picsum.photos/seed/person/64/64"
									alt="Sarah Jenkins"
									width={64}
									height={64}
									referrerPolicy="no-referrer"
								/>
							</div>
							<p className="mt-4 text-lg font-bold">Sarah Jenkins</p>
							<p className="text-slate-400">COO, Global Goods Co.</p>
						</div>
					</div>
				</section>

				{/* Final CTA */}
				<section className="py-32 px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="text-4xl font-bold tracking-tight text-slate-900">
							Ready to find your solution?
						</h2>
						<p className="mt-6 text-lg text-slate-600">
							Our team of experts is ready to help you design the perfect
							inventory workflow for your business.
						</p>
						<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Button
								type="button"
								size="lg"
								className="w-full rounded-full px-10 py-7 text-lg font-bold sm:w-auto shadow-lg hover:scale-105 transition-transform"
							>
								Talk to an Expert
							</Button>
							<Button
								type="button"
								variant="outline"
								size="lg"
								className="w-full rounded-full px-10 py-7 text-lg font-bold sm:w-auto border-slate-200 hover:bg-slate-50"
							>
								View All Features
							</Button>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
