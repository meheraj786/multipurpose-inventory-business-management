"use client";

import { AlertTriangle, PlayCircle, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

export function Hero() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.5 }}
		>
			<section className="relative bg-[#F9FAFB] flex flex-col items-center justify-center px-4 pt-20 pb-32 text-center overflow-hidden">
				{/* Floating Badge - Top Center */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
					className="mb-8 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 shadow-sm"
				>
					<span className="h-2 w-2 rounded-full bg-black" />
					<span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
						The new standard for inventory control
					</span>
				</motion.div>

				<div className="relative max-w-5xl">
					{/* Floating Card - Live Sales (Left) */}
					<div className="absolute -left-60 -top-20 hidden lg:block animate-float">
						<div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-200/50">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
								<TrendingUp size={20} />
							</div>
							<div className="text-left">
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
									Live Sales
								</p>
								<p className="text-sm font-bold text-slate-900">
									+124 Orders Today
								</p>
							</div>
						</div>
					</div>

					{/* Floating Card - Stock Alert (Right) */}
					<div
						className="absolute -right-60 top-12 hidden lg:block animate-float"
						style={{ animationDelay: "1.5s" }}
					>
						<div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-200/50">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500">
								<AlertTriangle size={20} />
							</div>
							<div className="text-left">
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
									Stock Alert
								</p>
								<p className="text-sm font-bold text-slate-900">
									SKU-402 Low Level
								</p>
							</div>
						</div>
					</div>

					{/* Main Headline */}
					<h1 className="mb-8 text-6xl font-extrabold tracking-tight text-slate-900 sm:text-8xl lg:text-[100px] leading-[0.95]">
						Smart Inventory <br />
						<span className="text-slate-400">
							for Modern <br /> Commerce.
						</span>
					</h1>

					{/* Subheadline */}
					<p className="mx-auto mb-12 max-w-2xl text-lg font-medium leading-relaxed text-slate-500 sm:text-xl">
						Eliminate stockouts and overstocking with Sell-Tech Suite. The only
						platform that scales as fast as your ambition.
					</p>

					{/* CTA Buttons */}
					<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
						<button
							type="button"
							className="h-16 w-full rounded-full bg-black px-10 text-lg font-bold text-white transition-all hover:bg-slate-800 hover:shadow-2xl active:scale-95 sm:w-auto"
						>
							Get Started
						</button>
						<button
							type="button"
							className="flex h-16 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-10 text-lg font-bold text-slate-900 transition-all hover:bg-slate-50 active:scale-95 sm:w-auto"
						>
							<PlayCircle size={24} />
							Book Demo
						</button>
					</div>
				</div>

				{/* Mobile Floating Elements (Simplified) */}
				<div className="mt-12 flex flex-wrap justify-center gap-4 lg:hidden">
					<div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-md">
						<TrendingUp size={16} className="text-emerald-500" />
						<span className="text-xs font-bold text-slate-900">
							+124 Orders Today
						</span>
					</div>
					<div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-md">
						<AlertTriangle size={16} className="text-rose-500" />
						<span className="text-xs font-bold text-slate-900">
							SKU-402 Low Level
						</span>
					</div>
				</div>
			</section>
		</motion.div>
	);
}
