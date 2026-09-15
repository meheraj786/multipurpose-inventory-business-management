"use client";

import { Star } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

const TESTIMONIALS = [
	{
		id: 1,
		quote:
			"The interface is so clean it actually makes inventory management enjoyable. We've reduced stockouts by 40% in just two months.",
		author: "Sarah Chen",
		role: "COO at ModeRetail",
		avatar: "https://picsum.photos/seed/sarah/100/100",
	},
	{
		id: 2,
		quote:
			"Finally, a SaaS tool that doesn't feel like it was built in 1995. The multi-warehouse sync is flawless.",
		author: "James Wilson",
		role: "Founder of HighPoint Goods",
		avatar: "https://picsum.photos/seed/james/100/100",
	},
	{
		id: 3,
		quote:
			"The predictive analytics have saved us thousands in capital that used to be tied up in slow-moving stock.",
		author: "Elena Rodriguez",
		role: "Logistics Director at Arca",
		avatar: "https://picsum.photos/seed/elena/100/100",
	},
];

export function Testimonials() {
	return (
		<section className=" py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-2xl text-center mb-16">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4"
					>
						What people are saying.
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.1 }}
						className="text-lg text-slate-400"
					>
						Trusted by modern operators worldwide.
					</motion.p>
				</div>

				<div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
					{TESTIMONIALS.map((testimonial, index) => (
						<motion.div
							key={testimonial.id}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.1 + 0.2 }}
							className="flex flex-col justify-between bg-white p-10 rounded-[40px] shadow-sm border border-slate-50"
						>
							<div>
								<div className="flex gap-1 mb-6">
									{[...Array(5)].map(() => (
										<Star
											key={testimonial.id + 1}
											className="h-5 w-5 fill-yellow-400 text-yellow-400"
										/>
									))}
								</div>
								<p className="text-xl font-medium leading-8 text-slate-900 mb-8">
									&quot;{testimonial.quote}&quot;
								</p>
							</div>
							<div className="flex items-center gap-4">
								<div className="relative h-12 w-12 overflow-hidden rounded-full">
									<Image
										src={testimonial.avatar}
										alt={testimonial.author}
										fill
										className="object-cover"
										referrerPolicy="no-referrer"
									/>
								</div>
								<div>
									<div className="font-bold text-slate-900">
										{testimonial.author}
									</div>
									<div className="text-sm text-slate-400">
										{testimonial.role}
									</div>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
