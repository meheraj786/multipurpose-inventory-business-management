import { AtSign, Globe, MessageSquare } from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";

const FOOTER_SECTIONS = [
	{
		title: "Platform",
		links: [
			{ label: "Live Sync", href: "#" },
			{ label: "Analytics", href: "#" },
			{ label: "Integrations", href: "#" },
			{ label: "Pricing", href: "#" },
		],
	},
	{
		title: "Resources",
		links: [
			{ label: "Case Studies", href: "#" },
			{ label: "Documentation", href: "#" },
			{ label: "API Reference", href: "#" },
			{ label: "Community", href: "#" },
		],
	},
	{
		title: "Company",
		links: [
			{ label: "About Us", href: "#" },
			{ label: "Careers", href: "#" },
			{ label: "Legal", href: "#" },
		],
	},
];

export function Footer() {
	return (
		<footer className="w-full bg-white px-4 pt-20 pb-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
					{/* Brand Section */}
					<div className="lg:col-span-5">
						<Logo />
						<p className="max-w-xs mt-6 text-[15px] leading-relaxed text-slate-500">
							The ultimate inventory operating system for high-growth commerce.
						</p>
					</div>

					{/* Links Sections */}
					<div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
						{FOOTER_SECTIONS.map((section) => (
							<div key={section.title}>
								<h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-900">
									{section.title}
								</h3>
								<ul className="space-y-4">
									{section.links.map((link) => (
										<li key={link.label}>
											<Link
												href={link.href}
												className="text-[15px] text-slate-400 transition-colors hover:text-slate-900"
											>
												{link.label}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>

				{/* Bottom Section */}
				<div className="mt-20 border-t border-slate-100 pt-10">
					<div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
						<p className="text-sm font-medium text-slate-400">
							© 2024 Sell-Tech Suite. Built for the next generation.
						</p>
						<div className="flex items-center gap-6 text-slate-300">
							<Link href="#" className="transition-colors hover:text-slate-600">
								<Globe size={20} strokeWidth={1.5} />
							</Link>
							<Link href="#" className="transition-colors hover:text-slate-600">
								<AtSign size={20} strokeWidth={1.5} />
							</Link>
							<Link href="#" className="transition-colors hover:text-slate-600">
								<MessageSquare size={20} strokeWidth={1.5} />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
