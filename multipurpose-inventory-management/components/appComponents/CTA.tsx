"use client";

import { motion } from "motion/react";

export function CTA() {
	return (
		<section className=" py-12 px-6 sm:px-8 lg:px-12">
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				whileInView={{ opacity: 1, scale: 1 }}
				viewport={{ once: true }}
				className="mx-auto max-w-7xl bg-black rounded-[48px] py-24 px-6 text-center sm:px-16 sm:py-32 overflow-hidden relative"
			>
				{/* Subtle gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

				<div className="relative z-10">
					<h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-8">
						Ready to take control?
					</h2>
					<p className="mx-auto max-w-2xl text-lg leading-8 text-slate-300 mb-12">
						Experience the difference of a modern inventory operating system.
						<br className="hidden sm:block" /> Join 10,000+ businesses today.
					</p>

					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
						<button
							type="button"
							className="w-full sm:w-auto rounded-full bg-white px-8 py-4 text-base font-bold text-black shadow-sm hover:bg-slate-100 transition-colors"
						>
							Start Your Free Trial
						</button>
						<button
							type="button"
							className="w-full sm:w-auto rounded-full border border-white/20 bg-transparent px-8 py-4 text-base font-bold text-white hover:bg-white/5 transition-colors"
						>
							Speak to an Expert
						</button>
					</div>

					<p className="text-sm text-slate-500">
						No credit card required. Cancel anytime.
					</p>
				</div>
			</motion.div>
		</section>
	);
}
