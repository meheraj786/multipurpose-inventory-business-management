"use client";

import { Mail, MapPin, Phone, Send } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CONTACT_INFO = [
	{
		icon: Mail,
		title: "Email Us",
		details: "support@stockmaster.com",
		description: "Our team usually responds within 2 hours.",
	},
	{
		icon: Phone,
		title: "Call Us",
		details: "+1 (555) 123-4567",
		description: "Mon-Fri from 8am to 6pm PST.",
	},
	{
		icon: MapPin,
		title: "Visit Us",
		details: "123 Inventory Way, Suite 400",
		description: "San Francisco, CA 94105",
	},
];

export default function ContactPage() {
	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		// Handle form submission logic here
		console.log("Form submitted");
	};

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
								Get in Touch
							</h1>
							<p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
								Have questions about Sell-Tech Suite? Our team is here to help
								you optimize your inventory and scale your business.
							</p>
						</motion.div>
					</div>
				</section>

				{/* Contact Content */}
				<section className="px-4 py-24 sm:px-6 lg:px-8 bg-slate-50">
					<div className="mx-auto max-w-7xl">
						<div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
							{/* Left Column: Contact Info */}
							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.5, delay: 0.2 }}
								className="space-y-12"
							>
								<div>
									<h2 className="text-3xl font-bold text-slate-900">
										Contact Information
									</h2>
									<p className="mt-4 text-lg text-slate-600">
										Reach out to us through any of these channels or use the
										form to send us a direct message.
									</p>
								</div>

								<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-1">
									{CONTACT_INFO.map((info) => (
										<div key={info.title} className="flex gap-6">
											<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black text-white">
												<info.icon size={24} />
											</div>
											<div>
												<h3 className="text-lg font-bold text-slate-900">
													{info.title}
												</h3>
												<p className="mt-1 font-medium text-slate-900">
													{info.details}
												</p>
												<p className="mt-1 text-sm text-slate-500">
													{info.description}
												</p>
											</div>
										</div>
									))}
								</div>

								{/* Social Proof / Trust Badge */}
								<div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
									<p className="text-sm font-bold uppercase tracking-wider text-slate-400">
										Trusted by
									</p>
									<div className="mt-6 flex flex-wrap gap-8 opacity-40 grayscale">
										<div className="h-8 w-24 bg-slate-300 rounded" />
										<div className="h-8 w-24 bg-slate-300 rounded" />
										<div className="h-8 w-24 bg-slate-300 rounded" />
									</div>
								</div>
							</motion.div>

							{/* Right Column: Contact Form */}
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.5, delay: 0.3 }}
								className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-100 sm:p-12"
							>
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="first-name">First Name</Label>
											<Input
												id="first-name"
												placeholder="Jane"
												className="h-12 rounded-xl border-slate-200 focus:ring-black"
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="last-name">Last Name</Label>
											<Input
												id="last-name"
												placeholder="Doe"
												className="h-12 rounded-xl border-slate-200 focus:ring-black"
												required
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="email">Work Email</Label>
										<Input
											id="email"
											type="email"
											placeholder="jane@company.com"
											className="h-12 rounded-xl border-slate-200 focus:ring-black"
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="subject">Subject</Label>
										<Input
											id="subject"
											placeholder="How can we help?"
											className="h-12 rounded-xl border-slate-200 focus:ring-black"
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="message">Message</Label>
										<textarea
											id="message"
											rows={4}
											placeholder="Tell us more about your needs..."
											className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
											required
										/>
									</div>

									<Button
										type="submit"
										className="w-full h-14 rounded-xl bg-black text-white font-bold hover:bg-slate-800 transition-all active:scale-[0.98]"
									>
										<Send size={18} className="mr-2" />
										Send Message
									</Button>

									<p className="text-center text-xs text-slate-400">
										By submitting this form, you agree to our{" "}
										<Link
											href="/privacy"
											className="underline hover:text-slate-600"
										>
											Privacy Policy
										</Link>
										.
									</p>
								</form>
							</motion.div>
						</div>
					</div>
				</section>

				{/* Map Placeholder Section */}
				{/* <section className="px-4 py-24 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-7xl">
						<div className="relative h-[400px] w-full overflow-hidden rounded-[2.5rem] bg-slate-100 border border-slate-200">
							<div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:24px_24px]">
								<div className="text-center">
									<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
										<MapPin size={32} className="text-black" />
									</div>
									<p className="font-bold text-slate-900">Sell-Tech Suite HQ</p>
									<p className="text-sm text-slate-500">San Francisco, CA</p>
								</div>
							</div>
						</div>
					</div>
				</section> */}
			</main>
		</div>
	);
}
