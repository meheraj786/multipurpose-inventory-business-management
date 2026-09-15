"use client";

import { LineChart, Sparkles, Users } from "lucide-react";
import { motion } from "motion/react";

const FEATURES = [
	{
		title: "Live Tracking",
		description:
			"Sync inventory across every channel in real-time. Say goodbye to overselling and manual updates.",
		icon: LineChart,
	},
	{
		title: "Predictive Insights",
		description:
			"Our AI analyzes your sales history to recommend exactly what to order and when.",
		icon: Sparkles,
	},
	{
		title: "Team Sync",
		description:
			"Coordinate warehouse staff, purchasers, and sales teams within a single, unified workflow.",
		icon: Users,
	},
];

export function Features() {
	return (
		<section className="bg-[#F9FAFB] py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-4xl text-center mb-20">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6"
					>
						Built for scale, designed for simplicity.
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.1 }}
						className="text-lg leading-8 text-slate-500 max-w-2xl mx-auto"
					>
						Every tool you need to master your supply chain, packaged in an
						interface your team will actually love to use.
					</motion.p>
				</div>

				<div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
					{FEATURES.map((feature, index) => (
						<motion.div
							key={feature.title}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.1 + 0.2 }}
							className="flex flex-col bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out "
						>
							<div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
								<feature.icon
									className="h-6 w-6 text-slate-900"
									aria-hidden="true"
								/>
							</div>
							<h3 className="text-xl font-bold leading-7 text-slate-900 mb-4">
								{feature.title}
							</h3>
							<p className="flex-auto text-base leading-7 text-slate-500">
								{feature.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
