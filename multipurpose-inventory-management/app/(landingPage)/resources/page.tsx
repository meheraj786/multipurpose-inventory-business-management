"use client";

import {
	BookOpen,
	ChevronRight,
	FileText,
	MessageSquare,
	PlayCircle,
	Search,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RESOURCE_CATEGORIES = [
	{
		title: "Documentation",
		description:
			"Step-by-step guides for setting up and scaling your operations with Sell-Tech Suite.",
		linkText: "Browse Docs",
		href: "/docs",
		icon: FileText,
	},
	{
		title: "Blog",
		description:
			"Insights on supply chain optimization, industry trends, and product updates.",
		linkText: "Read Blog",
		href: "/blog",
		icon: BookOpen,
	},
	{
		title: "Video Tutorials",
		description:
			"Visual guides to help you master advanced features and automate your workflow.",
		linkText: "Watch Videos",
		href: "/tutorials",
		icon: PlayCircle,
	},
	{
		title: "Customer Stories",
		description:
			"Learn how leading businesses use Sell-Tech Suite to scale their global operations.",
		linkText: "Read Stories",
		href: "/customers",
		icon: MessageSquare,
	},
];

export default function ResourcesPage() {
	return (
		<div className="min-h-screen bg-white font-sans">
			<main>
				{/* Hero Section */}
				<section className="px-4 pt-20 pb-16 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-7xl text-center">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
								Resources Hub
							</h1>
							<p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
								Everything you need to master inventory management. From
								in-depth documentation to inspiring customer success stories.
							</p>

							{/* Search Bar */}
							<div className="mt-10 relative mx-auto max-w-2xl">
								<div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none text-slate-400">
									<Search size={20} />
								</div>
								<Input
									type="text"
									placeholder="Search for articles, guides, or tutorials..."
									className="h-16 w-full rounded-xl border-slate-200 bg-slate-50/50 pl-14 pr-6 text-lg shadow-sm focus:ring-2 focus:ring-black transition-all"
								/>
							</div>
						</motion.div>
					</div>
				</section>

				{/* Resource Categories Grid */}
				<section className="bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-7xl">
						<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
							{RESOURCE_CATEGORIES.map((category, index) => (
								<motion.div
									key={category.title}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: index * 0.1 }}
									className="group flex flex-col rounded-2xl bg-white p-8 shadow-sm border border-slate-100 transition-all hover:shadow-md"
								>
									<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-900 transition-colors group-hover:bg-black group-hover:text-white">
										<category.icon size={24} />
									</div>
									<h3 className="text-xl font-bold text-slate-900">
										{category.title}
									</h3>
									<p className="mt-4 flex-grow text-sm leading-relaxed text-slate-600">
										{category.description}
									</p>
									<div className="mt-8 flex items-center gap-1 text-sm font-bold text-slate-900 group-hover:gap-2 transition-all">
										{category.linkText} <ChevronRight size={16} />
									</div>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* Support CTA Section */}
				<section className="px-4 py-24 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-7xl">
						<div className="relative overflow-hidden rounded-[2.5rem] bg-black px-8 py-16 text-center sm:px-16 sm:py-24">
							{/* Gradient background effect */}
							<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />

							<div className="relative z-10">
								<h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
									Can&apos;t find what you&apos;re looking for?
								</h2>
								<p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
									Our expert support team is available 24/7 to help you with any
									questions.
								</p>
								<div className="mt-10">
									<Button
										type="button"
										size="lg"
										className="h-14 rounded-xl bg-white px-10 font-bold text-black hover:bg-slate-100 transition-all active:scale-95"
									>
										Contact Support
									</Button>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
