"use client";

import {
	Activity,
	ArrowRight,
	ArrowUpRight,
	Bot,
	CheckCircle,
	Clock,
	Globe,
	Layers,
	Phone,
	RotateCw,
	Shield,
	Sliders,
	Sparkles,
	Terminal,
	Users,
} from "lucide-react";
import { motion, type Variants } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Header from "@/components/appComponents/Header";

const fadeInUp: Variants = {
	hidden: { opacity: 0, y: 30 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
	},
};

const staggerContainer: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const _hoverScale: Variants = {
	hover: { y: -4, transition: { duration: 0.2, ease: "easeOut" } },
};

export default function EnterpriseLandingPage() {
	return (
		<div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white overflow-x-hidden">
			<Header />
			<main>
				<HeroSection />
				<MetricsSection />
				<SystemViewSection />
				<OperationalSuitesSection />
				<InfrastructureSection />
				<FooterCTA />

				<PixelPrecisionSection />
			</main>
		</div>
	);
}

function HeroSection() {
	return (
		<section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-6 overflow-hidden">
			<div className="max-w-5xl mx-auto text-center flex flex-col items-center">
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-[10px] font-semibold text-zinc-600 tracking-wider uppercase mb-8"
				>
					<Sparkles className="h-3 w-3 text-zinc-500" />
					Enterprise Excellence
				</motion.div>

				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.1 }}
					className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 max-w-4xl leading-[1.1] mb-6"
				>
					Modern Software That Helps Businesses Grow.
				</motion.h1>

				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="text-zinc-500 text-base md:text-lg max-w-2xl leading-relaxed mb-10"
				>
					A comprehensive ecosystem for high-stakes enterprise management. From
					dynamic inventory controls to precision sales analytics, we build
					tools that empower decision-makers.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="flex flex-col sm:flex-row items-center gap-4 mb-16"
				>
					<Link
						href="/signup"
						type="button"
						className="w-full sm:w-auto bg-zinc-950 text-white font-medium px-8 py-3.5 rounded-lg hover:bg-zinc-800 transition-all shadow-md active:scale-95"
					>
						Get Started for Free
					</Link>
					{/* <button
            type="button"
            onClick={() => router.push("#suites")}
            className="w-full sm:w-auto bg-white border border-zinc-200 text-zinc-800 font-medium px-8 py-3.5 rounded-lg hover:bg-zinc-50 transition-all active:scale-95"
          >
            Login
          </button> */}
				</motion.div>
			</div>

			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 40 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.4 }}
				className="max-w-5xl mx-auto px-4"
			>
				<div className="relative rounded-2xl border border-zinc-200 bg-zinc-50 p-3 shadow-2xl overflow-hidden group">
					<div className="absolute inset-0 " />
					{/* <div className="relative rounded-xl overflow-hidden bg-zinc-950 p-6 text-white min-h-[380px] flex flex-col justify-between shadow-inner">
						<div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
							<div className="flex items-center gap-3">
								<div className="flex gap-1.5">
									<span className="w-2.5 h-2.5 rounded-full bg-zinc-850" />
									<span className="w-2.5 h-2.5 rounded-full bg-zinc-850" />
									<span className="w-2.5 h-2.5 rounded-full bg-zinc-850" />
								</div>
								<span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
									SYSTEM STABLE 
								</span>
							</div>
							<span className="text-xs font-mono text-zinc-400">
								DEMO_SESSION_ACTIVE
							</span>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-auto">
							<div className="space-y-1">
								<p className="text-[10px] uppercase tracking-wider text-zinc-500">
									Total Revenue
								</p>
								<p className="text-3xl font-bold tracking-tight">$2,937.20</p>
								<span className="text-[10px] text-zinc-400 font-mono">
									+12.4% vs last period
								</span>
							</div>
							<div className="space-y-1">
								<p className="text-[10px] uppercase tracking-wider text-zinc-500">
									Orders
								</p>
								<p className="text-3xl font-bold tracking-tight">115</p>
								<span className="text-[10px] text-zinc-400 font-mono">
									99.8% fulfillment rating
								</span>
							</div>
							<div className="space-y-1">
								<p className="text-[10px] uppercase tracking-wider text-zinc-500">
									Net Profit
								</p>
								<p className="text-3xl font-bold tracking-tight">$1,0354.0K</p>
								<span className="text-[10px] text-zinc-400 font-mono">
									Margin index 42%
								</span>
							</div>
						</div>

						<div className="mt-8 pt-6 border-t border-zinc-800/60 flex items-end justify-between h-24 gap-2">
							{[40, 25, 60, 45, 90, 75, 55, 80, 100, 70, 85, 110, 95].map(
								(val) => (
									<div
										key={`hero-bar-${val}`}
										className="flex-1 bg-zinc-800 rounded-t-sm relative group/bar hover:bg-zinc-600 transition-colors"
										style={{ height: `${val}%` }}
									>
										<div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-zinc-900 text-[9px] px-1 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity mb-1 whitespace-nowrap pointer-events-none">
											${val * 12}
										</div>
									</div>
								),
							)}
						</div>
					</div> */}
					<Image
						src="/hero.png"
						alt="Hero"
						width={1000}
						height={1000}
						className="w-full"
					/>
				</div>
			</motion.div>
		</section>
	);
}

function MetricsSection() {
	return (
		<section className="py-20 px-6 border-t border-zinc-100 bg-white">
			<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={fadeInUp}
					className="space-y-6"
				>
					<h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 max-w-md leading-tight">
						Software Built for Real Businesses.
					</h2>
					<p className="text-zinc-500 text-sm md:text-base leading-relaxed max-w-xl">
						We&apos;ve stripped away the noise of traditional enterprise
						software. Our design philosophy centers on technical
						luxury—delivering high-fidelity data through a lens of absolute
						clarity.
					</p>
					<p className="text-zinc-500 text-sm md:text-base leading-relaxed max-w-xl">
						Whether you&apos;re managing global supply chains or a boutique
						operation, Sell Tech Suits provides the structural integrity
						required to scale with confidence.
					</p>
				</motion.div>

				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={staggerContainer}
					className="grid grid-cols-1 sm:grid-cols-2 gap-6"
				>
					<motion.div
						variants={fadeInUp}
						className="p-8 rounded-2xl bg-zinc-50 border border-zinc-200/60 flex flex-col justify-between min-h-[180px] hover:shadow-md transition-shadow"
					>
						<div className="p-2 w-9 h-9 rounded bg-zinc-200/40 flex items-center justify-center text-zinc-800">
							<Activity className="h-5 w-5" />
						</div>
						<div className="space-y-1.5 mt-8">
							<p className="text-3xl font-bold tracking-tight">99.9%</p>
							<p className="text-xs text-zinc-500 leading-relaxed">
								Uptime reliability for mission-critical operations.
							</p>
						</div>
					</motion.div>

					<motion.div
						variants={fadeInUp}
						className="p-8 rounded-2xl bg-zinc-950 border border-zinc-900 text-white flex flex-col justify-between min-h-[180px] hover:shadow-lg transition-shadow"
					>
						<div className="p-2 w-9 h-9 rounded bg-zinc-800/80 flex items-center justify-center text-zinc-300">
							<Terminal className="h-5 w-5" />
						</div>
						<div className="space-y-1.5 mt-8">
							<p className="text-3xl font-bold tracking-tight">150ms</p>
							<p className="text-xs text-zinc-400 leading-relaxed">
								Global average latency across our platform.
							</p>
						</div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}

function SystemViewSection() {
	const [activeTab, setActiveTab] = useState<"smart" | "ai" | "sales">("smart");

	return (
		<section
			id="features"
			className="py-20 px-6 bg-zinc-50/50 border-t border-b border-zinc-100"
		>
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
					<div className="space-y-3">
						<h2 className="text-3xl font-bold tracking-tight text-zinc-900">
							Inventory & Business Management System
						</h2>
						<p className="text-zinc-500 text-sm max-w-xl">
							The core of the Sell Tech Suits ecosystem. A singular source of
							truth for your entire operation.
						</p>
					</div>
					<a
						href="#suites"
						className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-900 hover:gap-2.5 transition-all"
					>
						Explore Full Features <ArrowRight className="h-3.5 w-3.5" />
					</a>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
					<div className="lg:col-span-7 flex flex-col">
						<div className="flex-1 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm flex flex-col justify-between min-h-[350px]">
							<div className="flex items-center justify-between pb-3 border-b border-zinc-100">
								<div className="flex items-center gap-1.5">
									<span className="w-2 h-2 rounded-full bg-zinc-200" />
									<span className="w-2 h-2 rounded-full bg-zinc-200" />
									<span className="w-2 h-2 rounded-full bg-zinc-200" />
									<span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest ml-3">
										LIVE SYSTEM VIEW
									</span>
								</div>
								<span className="text-[10px] font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded uppercase">
									SYSTEM_03
								</span>
							</div>

							<div className="flex-1 flex flex-col justify-center">
								{activeTab === "smart" && (
									<motion.div
										key="smart"
										initial={{ opacity: 0, y: 5 }}
										animate={{ opacity: 1, y: 0 }}
										className=""
									>
										{/* <div className="grid grid-cols-3 gap-3">
											<div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
												<span className="text-[9px] text-zinc-400 font-mono">
													ON_HAND
												</span>
												<p className="text-lg font-bold text-zinc-900">
													14,240 units
												</p>
											</div>
											<div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
												<span className="text-[9px] text-zinc-400 font-mono">
													REORDER_INDEX
												</span>
												<p className="text-lg font-bold text-zinc-900">
													Optimal
												</p>
											</div>
											<div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
												<span className="text-[9px] text-zinc-400 font-mono">
													ALERT_TRIGGERS
												</span>
												<p className="text-lg font-bold text-zinc-900">
													0 Active
												</p>
											</div>
										</div>
										<div className="p-4 rounded-lg bg-zinc-900 text-white text-xs font-mono">
											<span className="text-zinc-500">
												Predictive stock levels calculated:
											</span>
											<p className="text-zinc-200 mt-1">
												Recommended acquisition: +15% raw product material for
												high-season demand spikes.
											</p>
										</div> */}
										<Image
											src="/inventory.png"
											alt="Smart"
											width={800}
											height={100}
										/>
									</motion.div>
								)}

								{activeTab === "ai" && (
									<motion.div
										key="ai"
										initial={{ opacity: 0, y: 5 }}
										animate={{ opacity: 1, y: 0 }}
										className="space-y-3"
									>
										{/* <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg text-xs text-zinc-700">
											<p className="font-semibold text-zinc-900">Query:</p>
											<p className="italic">
												&quot;Are we protected against dynamic market
												fluctuations?&quot;
											</p>
										</div>
										<div className="p-3 bg-zinc-950 text-white rounded-lg text-xs space-y-1.5 font-mono">
											<span className="text-zinc-500">
												AI Operational Assistant:
											</span>
											<p className="text-zinc-200">
												Checking current inventory thresholds. Our dynamic
												buffers show 24 days of operational run-time coverage.
											</p>
										</div> */}
										<Image src="/ai.png" alt="Smart" width={800} height={100} />
									</motion.div>
								)}

								{activeTab === "sales" && (
									<motion.div
										key="sales"
										initial={{ opacity: 0, y: 5 }}
										animate={{ opacity: 1, y: 0 }}
										className="space-y-4"
									>
										{/* <div className="p-3.5 rounded-lg border border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
											<div className="space-y-0.5">
												<p className="text-[10px] text-zinc-400 font-mono">
													GLOBAL_SETTLEMENTS
												</p>
												<p className="text-sm font-semibold text-zinc-900">
													Multi-Channel Routing
												</p>
											</div>
											<span className="px-2 py-0.5 bg-zinc-900 text-white text-[9px] rounded font-mono">
												AUTO
											</span>
										</div>
										<div className="grid grid-cols-2 gap-3">
											<div className="p-3.5 rounded-lg border border-zinc-100 space-y-1">
												<span className="text-[9px] text-zinc-400 font-mono">
													USD CONVERSION
												</span>
												<p className="text-sm font-bold text-zinc-900">
													Automatic / Spot
												</p>
											</div>
											<div className="p-3.5 rounded-lg border border-zinc-100 space-y-1">
												<span className="text-[9px] text-zinc-400 font-mono">
													SETTLEMENT RATE
												</span>
												<p className="text-sm font-bold text-zinc-900">
													Instant
												</p>
											</div>
										</div> */}
										<Image
											src="/sales.png"
											alt="Smart"
											width={800}
											height={100}
										/>
									</motion.div>
								)}
							</div>

							<div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
								<span>ENGINE_V1.14.2</span>
								<span className="flex items-center gap-1">
									<span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />{" "}
									FEED CONNECTED
								</span>
							</div>
						</div>
					</div>

					<div className="lg:col-span-5 flex flex-col justify-start gap-4">
						<button
							type="button"
							onClick={() => setActiveTab("smart")}
							className={`p-6 rounded-2xl border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 text-left ${
								activeTab === "smart"
									? "border-zinc-900 bg-white shadow-xs"
									: "border-zinc-200/60 hover:bg-white"
							}`}
						>
							<div className="flex items-start gap-4">
								<div
									className={`p-2 rounded ${activeTab === "smart" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"}`}
								>
									<Layers className="h-5 w-5" />
								</div>
								<div className="space-y-1">
									<h3 className="text-sm font-bold text-zinc-900">
										Smart Inventory
									</h3>
									<p className="text-xs text-zinc-500 leading-relaxed">
										AI-driven stock optimization and predictive reordering
										cycles.
									</p>
								</div>
							</div>
						</button>

						<button
							type="button"
							onClick={() => setActiveTab("ai")}
							className={`p-6 rounded-2xl border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 text-left ${
								activeTab === "ai"
									? "border-zinc-900 bg-white shadow-xs"
									: "border-zinc-200/60 hover:bg-white"
							}`}
						>
							<div className="flex items-start gap-4">
								<div
									className={`p-2 rounded ${activeTab === "ai" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"}`}
								>
									<Bot className="h-5 w-5" />
								</div>
								<div className="space-y-1">
									<h3 className="text-sm font-bold text-zinc-900">
										AI Assistant
									</h3>
									<p className="text-xs text-zinc-500 leading-relaxed">
										Natural language queries for complex operational data sets.
									</p>
								</div>
							</div>
						</button>

						<button
							type="button"
							onClick={() => setActiveTab("sales")}
							className={`p-6 rounded-2xl border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 text-left ${
								activeTab === "sales"
									? "border-zinc-900 bg-white shadow-xs"
									: "border-zinc-200/60 hover:bg-white"
							}`}
						>
							<div className="flex items-start gap-4">
								<div
									className={`p-2 rounded ${activeTab === "sales" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"}`}
								>
									<Globe className="h-5 w-5" />
								</div>
								<div className="space-y-1">
									<h3 className="text-sm font-bold text-zinc-900">
										Global Sales
									</h3>
									<p className="text-xs text-zinc-500 leading-relaxed">
										Multi-currency, omnichannel sales tracking in real-time.
									</p>
								</div>
							</div>
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}

export function PixelPrecisionSection() {
	const fadeInUp: Variants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: [0.16, 1, 0.3, 1] as const,
			},
		},
	};
	const softwares = [
		{
			id: "analytics-os",
			title: "Amar Hishab",
			subtitle:
				"Small Business and daily cash management with dues and payments tracking.",
			monitorLabel: "ANALYTICS OS",
			monitorNumber: "MONITOR 01",
			href: "https://amar-hishab.vercel.app/",
			image: "/amar-hishab.png",
			renderContent: () => (
				<div className="space-y-3">
					<div>
						<span className="text-[9px] text-zinc-500 font-mono">
							REALTIME RATE
						</span>
						<p className="text-2xl font-bold font-mono">1.4K/S</p>
					</div>
					{/* Sparkline Graph */}
					<div className="h-10 flex items-end gap-1">
						{[20, 40, 30, 60, 50, 75, 90, 80, 100].map((h) => (
							<div
								key={`spark-${h}`}
								className="flex-1 bg-zinc-800 rounded-xs"
								style={{ height: `${h}%` }}
							/>
						))}
					</div>
				</div>
			),
			bottomBar: "GLOBAL STREAM SECURE",
			exploreLabel: "Launch Analytics OS",
		},
		{
			id: "registry-pro",
			title: "Amar Khata",
			subtitle: "Inventory Management for small and medium-sized businesses.",
			monitorLabel: "REGISTRY PRO",
			monitorNumber: "MONITOR 02",
			href: "https://amar-khata-365.vercel.app/",
			image: "/amar-khata.png",
			renderContent: () => (
				<div className="space-y-1.5 text-[10px] font-mono">
					<div className="flex justify-between text-zinc-500">
						<span>ITEM</span>
						<span>STOCK</span>
					</div>
					<div className="flex justify-between border-b border-zinc-900 pb-1">
						<span className="text-zinc-200">Premium Suit _ Black</span>
						<span>21 Units</span>
					</div>
					<div className="flex justify-between border-b border-zinc-900 pb-1">
						<span className="text-zinc-200">Industrial Wool</span>
						<span>140 Units</span>
					</div>
					<div className="flex justify-between">
						<span className="text-zinc-200">Raw Polyester</span>
						<span>95 Units</span>
					</div>
				</div>
			),
			bottomBar: "GRID AUTO-REFRESH : ON",
			exploreLabel: "Launch Registry Pro",
		},
		{
			id: "ledger-ai",
			title: "Kapor Dokan",
			subtitle:
				"Inventory Management for small and medium-sized fabrics businesses.",
			monitorLabel: "LEDGER AI",
			monitorNumber: "MONITOR 03",
			href: "https://kapor-dokan.vercel.app/",
			image: "/kapor-dokan.png",

			renderContent: () => (
				<div className="space-y-2">
					<div>
						<span className="text-[9px] text-zinc-500 font-mono">
							TOTAL REVENUE INDEX
						</span>
						<p className="text-xl font-bold font-mono">$1.1M</p>
					</div>
					<div className="p-2 bg-zinc-900 rounded text-[9px] font-mono text-zinc-300 leading-normal">
						Target threshold: 92% achieved. Peak velocity active.
					</div>
				</div>
			),
			bottomBar: "AUTO SAVE TO CLOUD",
			exploreLabel: "Launch Ledger AI",
		},
	];

	return (
		<section className="py-24 px-6 bg-white text-center">
			<div className="max-w-6xl mx-auto">
				{/* Header Info */}
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeInUp}
					className="space-y-3 mb-16"
				>
					<h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900">
						More Business Softwares
					</h2>
					<p className="text-zinc-500 text-sm max-w-lg mx-auto">
						We&apos;ve stripped away the noise of traditional enterprise
						software. Our design philosophy centers on technical
						luxury—delivering high-fidelity data through a lens of absolute
						clarity.
					</p>
				</motion.div>

				{/* 3-Monitor Clean Layout Visualizer Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
					{softwares.map((sw) => (
						<motion.a
							key={sw.id}
							href={sw.href}
							whileHover={{ y: -4 }}
							className="group p-3 rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm flex flex-col justify-between hover:border-zinc-400 hover:shadow-md transition-all duration-300 relative overflow-hidden"
						>
							<div className="relative rounded-xl overflow-hidden bg-zinc-950 p-4 text-white text-left min-h-[220px] flex flex-col justify-between">
								<Image
									src={sw.image || "/placeholder.png"}
									alt={sw.title}
									width={500}
									height={500}
									className="w-full h-full object-cover"
								/>
							</div>

							<div className="text-left pt-3 px-1">
								<div className="flex items-center justify-between">
									<span className="text-xs uppercase font-bold text-zinc-800 tracking-wider">
										{sw.title}
									</span>
									<span className="text-[10px] font-semibold text-zinc-400 group-hover:text-zinc-900 transition-colors inline-flex items-center gap-0.5">
										Explore <ArrowUpRight className="h-3 w-3" />
									</span>
								</div>
								<p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
									{sw.subtitle}
								</p>
							</div>
						</motion.a>
					))}
				</div>
			</div>
		</section>
	);
}

const hoverScale: Variants = {
	hover: {
		y: -4,
		transition: { duration: 0.2, ease: "easeOut" },
	},
};

export function OperationalSuitesSection() {
	return (
		<section
			id="suites"
			className="py-24 px-6 md:px-12 bg-[#f9f9fb] border-t border-b border-zinc-100"
		>
			<div className="max-w-7xl mx-auto">
				{/* Left-aligned Header Title matching the design */}
				<h2 className="text-3xl md:text-[36px] font-bold tracking-tight text-zinc-900 mb-12 text-left">
					Specialized Operational Suites
				</h2>

				{/* Grid layout of Suites */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{/* Card 1: Inventory Suite */}
					<motion.div
						variants={hoverScale}
						whileHover="hover"
						className="p-8 rounded-[24px] bg-white border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between min-h-[100px]"
					>
						<div className="space-y-6">
							<div className="flex items-start justify-between">
								{/* Custom Minimalist Warehouse Icon */}
								<div className="text-zinc-900 mt-1">
									<svg
										className="h-6 w-6"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										role="img"
										aria-labelledby="warehouse-title"
									>
										<title id="warehouse-title">Warehouse</title>
										<path d="M3 10l9-7 9 7v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10z" />
										<path d="M9 21v-6h6v6" />
										<path d="M12 15v6" />
									</svg>
								</div>
								<span className="text-[9px] font-bold uppercase tracking-wider bg-[#121214] text-white px-2.5 py-1 rounded-sm">
									Available
								</span>
							</div>
							<div className="space-y-2">
								<h3 className="text-[19px] font-bold text-zinc-900 tracking-tight">
									Inventory Suite
								</h3>
								<p className="text-sm text-zinc-500 leading-relaxed font-normal">
									Warehouse management with integrated RFID support.
								</p>
							</div>
						</div>
					</motion.div>

					{/* Card 2: Restaurant OS */}
					<motion.div
						variants={hoverScale}
						whileHover="hover"
						className="p-8 rounded-[24px] bg-white border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between min-h-[100px]"
					>
						<div className="space-y-6">
							<div className="flex items-start justify-between">
								{/* Custom Fork & Knife Utensils Icon */}
								<div className="text-zinc-900 mt-1">
									<svg
										className="h-6 w-6"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<title id="fork-knife-title">Fork & Knife</title>
										<path d="M5 3v9M3 3v5c0 1.5 1 2.5 2 2.5s2-1 2-2.5V3" />
										<path d="M11 3v18M11 3c2 0 3 2 3 5v5H11" />
									</svg>
								</div>
								<span className="text-[9px] font-bold uppercase tracking-wider bg-[#121214] text-white px-2.5 py-1 rounded-sm">
									Available
								</span>
							</div>
							<div className="space-y-2">
								<h3 className="text-[19px] font-bold text-zinc-900 tracking-tight">
									Restaurant OS
								</h3>
								<p className="text-sm text-zinc-500 leading-relaxed font-normal">
									Unified front-of-house and kitchen operations engine.
								</p>
							</div>
						</div>
					</motion.div>

					{/* Card 3: Retail POS */}
					<motion.div
						variants={hoverScale}
						whileHover="hover"
						className="p-8 rounded-[24px] bg-white border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between min-h-[100px]"
					>
						<div className="space-y-6">
							<div className="flex items-start justify-between">
								{/* Custom Register/POS Terminal Icon */}
								<div className="text-zinc-900 mt-1">
									<svg
										className="h-6 w-6"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<title id="register-pos-title">Register/POS Terminal</title>
										<rect x="3" y="11" width="18" height="10" rx="2" />
										<path d="M12 2v5" />
										<path d="M8 5h8" />
										<circle cx="7" cy="15" r="1" />
										<circle cx="12" cy="15" r="1" />
										<circle cx="17" cy="15" r="1" />
									</svg>
								</div>
								<span className="text-[9px] font-bold uppercase tracking-wider bg-[#121214] text-white px-2.5 py-1 rounded-sm">
									Available
								</span>
							</div>
							<div className="space-y-2">
								<h3 className="text-[19px] font-bold text-zinc-900 tracking-tight">
									Retail OS
								</h3>
								<p className="text-sm text-zinc-500 leading-relaxed font-normal">
									A next-generation checkout experience for modern retail.
								</p>
							</div>
						</div>
					</motion.div>

					{/* Card 4: Business Analytics */}
					<motion.div
						variants={hoverScale}
						whileHover="hover"
						className="p-8 rounded-[24px] bg-white border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between min-h-[100px]"
					>
						<div className="space-y-6">
							<div className="flex items-start justify-between">
								{/* Custom Rising Chart/Line-Graph Icon */}
								<div className="text-zinc-900 mt-1">
									<svg
										className="h-6 w-6"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<title id="rising-chart-title">
											Rising Chart/Line-Graph
										</title>
										<path d="M18 20V10" />
										<path d="M12 20V4" />
										<path d="M6 20v-6" />
										<path d="m3 3 18 18" />
									</svg>
								</div>
								<span className="text-[9px] font-bold uppercase tracking-wider bg-[#121214] text-white px-2.5 py-1 rounded-sm">
									Available
								</span>
							</div>
							<div className="space-y-2">
								<h3 className="text-[19px] font-bold text-zinc-900 tracking-tight">
									Business Analytics
								</h3>
								<p className="text-sm text-zinc-500 leading-relaxed font-normal">
									Deep-dive financial forecasting and trend analysis.
								</p>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}

const INFRA_FEATURES = [
	{
		title: "Zero Trust Security",
		desc: "End-to-end encryption for every data packet across our entire network.",
		icon: Shield,
	},
	{
		title: "Robust API First",
		desc: "Integrate with your existing stack seamlessly using our GraphQL endpoints.",
		icon: Terminal,
	},
	{
		title: "Global Compliance",
		desc: "Fully GDPR, SOC2 Type II, and HIPAA compliant infrastructure.",
		icon: Globe,
	},
	{
		title: "Rapid Deployment",
		desc: "Go from onboarding to full operation in hours, not weeks.",
		icon: Clock,
	},
	{
		title: "Role-Based Access",
		desc: "Granular permissions to ensure the right people have the right data.",
		icon: Users,
	},
	{
		title: "Real-time Sync",
		desc: "Synchronized data across all devices and regions in milliseconds.",
		icon: RotateCw,
	},
	{
		title: "Dynamic Theme Engine",
		desc: "Auto-switching interfaces optimized for any ambient lighting.",
		icon: Sparkles,
	},
	{
		title: "Predictive Ops",
		desc: "Forecasting models that learn from your unique business patterns.",
		icon: Sliders,
	},
	{
		title: "Priority Support",
		desc: "24/7 access to enterprise-level technical account managers.",
		icon: CheckCircle,
	},
];

function InfrastructureSection() {
	return (
		<section
			id="infrastructure"
			className="py-24 px-6 bg-white border-b border-zinc-100"
		>
			<div className="max-w-7xl mx-auto">
				<div className="space-y-3 mb-16 text-center">
					<h2 className="text-3xl font-bold tracking-tight text-zinc-900">
						Enterprise Grade Infrastructure
					</h2>
					<p className="text-zinc-500 text-sm max-w-lg mx-auto">
						Engineering excellence meets minimalist design.
					</p>
				</div>

				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={staggerContainer}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
				>
					{INFRA_FEATURES.map((feat) => {
						const IconComponent = feat.icon;
						return (
							<motion.div
								key={feat.title}
								variants={fadeInUp}
								className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/50 hover:bg-white hover:border-zinc-300 hover:shadow-xs transition-all space-y-3"
							>
								<div className="p-2 w-9 h-9 rounded bg-zinc-200/40 flex items-center justify-center text-zinc-800">
									<IconComponent className="h-5 w-5" />
								</div>
								<div className="space-y-1">
									<h3 className="text-sm font-bold text-zinc-900">
										{feat.title}
									</h3>
									<p className="text-xs text-zinc-500 leading-relaxed">
										{feat.desc}
									</p>
								</div>
							</motion.div>
						);
					})}
				</motion.div>
			</div>
		</section>
	);
}

function FooterCTA() {
	return (
		<footer className="bg-zinc-950 text-white pt-24 pb-12 px-6">
			<div className="max-w-5xl mx-auto text-center flex flex-col items-center">
				<h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-2xl leading-[1.15] mb-6">
					Ready to Simplify Your Business?
				</h2>

				<p className="text-zinc-400 text-sm md:text-base max-w-xl leading-relaxed mb-10">
					Experience the difference of enterprise software designed with the
					precision of a high-end tool. Start your trial or request a custom
					deployment.
				</p>

				<div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
					<button
						type="button"
						className="w-full sm:w-auto bg-white text-zinc-950 font-semibold text-sm px-8 py-3.5 rounded-lg hover:bg-zinc-200 transition-colors"
					>
						Get Started Now
					</button>
					<button
						type="button"
						className="w-full sm:w-auto bg-transparent border border-zinc-800 text-zinc-200 font-semibold text-sm px-8 py-3.5 rounded-lg hover:bg-zinc-900 transition-colors inline-flex items-center justify-center gap-2"
					>
						<Phone className="h-4 w-4 text-zinc-400" /> Talk to Sales
					</button>
				</div>

				{/* <div className="w-full pt-8 border-t border-zinc-900/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-4">
          <p>
            © {new Date().getFullYear()} Sell Tech Suits. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#terms" className="hover:text-zinc-300 transition-colors">
              Terms of Service
            </a>
            <a
              href="#privacy"
              className="hover:text-zinc-300 transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div> */}
			</div>
		</footer>
	);
}
