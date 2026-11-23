// "use client";

// import { Menu, X } from "lucide-react";
// import { AnimatePresence, motion } from "motion/react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import React from "react";
// import Logo from "./Logo";

// const NAV_ITEMS = [
// 	{ label: "Home", href: "/" },
// 	{ label: "Features", href: "/features" },
// 	{ label: "Platform", href: "/platform" },
// 	{ label: "Solutions", href: "/solutions" },
// 	{ label: "Resources", href: "/resources" },
// 	{ label: "Pricing", href: "/pricing" },
// 	{ label: "Contact", href: "/contact" },
// ];

// const Header = () => {
// 	const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
// 	const path = usePathname();
// 	return (
// 		<header className="w-full z-9999 fixed px-4 py-6 sm:px-6 lg:px-8">
// 			<div className="mx-auto max-w-7xl">
// 				<nav className="relative flex items-center justify-between rounded-full bg-white/80 px-6 py-3 shadow-sm backdrop-blur-md border border-black/5">
// 					{/* Logo Section */}
// 					<Logo />

// 					{/* Desktop Navigation */}
// 					<ul className="hidden items-center gap-8 md:flex">
// 						{NAV_ITEMS.map((item) => (
// 							<li key={item.label}>
// 								<Link
// 									href={item.href}
// 									className={`text-sm  transition-colors hover:text-slate-900 duration-150 ${path === item.href ? "text-black font-bold" : ""}`}
// 								>
// 									{item.label}
// 								</Link>
// 							</li>
// 						))}
// 					</ul>

// 					{/* Desktop Actions */}
// 					<div className="hidden items-center gap-4 md:flex">
// 						<Link
// 							href="/login"
// 							className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
// 						>
// 							Log In
// 						</Link>
// 						<Link
// 							href="/signup"
// 							className="rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95"
// 						>
// 							Get Started
// 						</Link>
// 					</div>

// 					{/* Mobile Menu Toggle */}
// 					<button
// 						type="button"
// 						className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 md:hidden"
// 						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
// 						aria-label="Toggle menu"
// 					>
// 						{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
// 					</button>
// 				</nav>

// 				{/* Mobile Navigation Menu */}
// 				<AnimatePresence>
// 					{isMobileMenuOpen && (
// 						<motion.div
// 							initial={{ opacity: 0, y: -10 }}
// 							animate={{ opacity: 1, y: 0 }}
// 							exit={{ opacity: 0, y: -10 }}
// 							className="absolute left-4 right-4 top-24 z-50 overflow-hidden rounded-3xl border border-black/5 bg-white p-6 shadow-xl md:hidden"
// 						>
// 							<ul className="flex flex-col gap-4">
// 								{NAV_ITEMS.map((item) => (
// 									<li key={item.label}>
// 										<Link
// 											href={item.href}
// 											className="block text-lg font-medium text-slate-600"
// 											onClick={() => setIsMobileMenuOpen(false)}
// 										>
// 											{item.label}
// 										</Link>
// 									</li>
// 								))}
// 								<hr className="my-2 border-slate-100" />
// 								<li>
// 									<Link
// 										href="/login"
// 										className="block text-lg font-medium text-slate-600"
// 										onClick={() => setIsMobileMenuOpen(false)}
// 									>
// 										Log In
// 									</Link>
// 								</li>
// 								<li>
// 									<Link
// 										href="/signup"
// 										className="block w-full rounded-2xl bg-black py-4 text-center text-lg font-semibold text-white"
// 										onClick={() => setIsMobileMenuOpen(false)}
// 									>
// 										Start Free Trial
// 									</Link>
// 								</li>
// 							</ul>
// 						</motion.div>
// 					)}
// 				</AnimatePresence>
// 			</div>
// 		</header>
// 	);
// };

// export default Header;

"use client";

import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
	return (
		<header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 py-4">
			<div className="max-w-7xl mx-auto flex items-center justify-between">
				{/* Logo */}
				<Logo />

				{/* Navigation Links */}
				<nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
					<a href="#features" className="hover:text-zinc-900 transition-colors">
						Ecosystem
					</a>
					<a href="#suites" className="hover:text-zinc-900 transition-colors">
						Suites
					</a>
					<a
						href="#infrastructure"
						className="hover:text-zinc-900 transition-colors"
					>
						Infrastructure
					</a>
				</nav>

				{/* Call to Actions */}
				<div className="flex items-center gap-3">
					<Link
						href="/login"
						type="button"
						className="hidden sm:inline-flex text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 px-4 py-2 transition-colors"
					>
						Sign In
					</Link>
					<Link
						href="/signup"
						type="button"
						className="bg-zinc-950 text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors"
					>
						Start Free Trial
					</Link>
				</div>
			</div>
		</header>
	);
}
