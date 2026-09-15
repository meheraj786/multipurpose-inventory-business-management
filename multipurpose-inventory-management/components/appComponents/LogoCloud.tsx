"use client";

import { motion } from "motion/react";
import Image from "next/image";

const LOGOS = [
	{
		id: 1,
		src: "https://picsum.photos/seed/brand1/200/200?grayscale",
		alt: "Brand 1",
	},
	{
		id: 2,
		src: "https://picsum.photos/seed/brand2/200/200?grayscale",
		alt: "Brand 2",
	},
	{
		id: 3,
		src: "https://picsum.photos/seed/brand3/200/200?grayscale",
		alt: "Brand 3",
	},
	{
		id: 4,
		src: "https://picsum.photos/seed/brand4/200/200?grayscale",
		alt: "Brand 4",
	},
	{
		id: 5,
		src: "https://picsum.photos/seed/brand5/200/200?grayscale",
		alt: "Brand 5",
	},
];

export function LogoCloud() {
	return (
		<section className="bg-white py-20 border-y border-slate-100">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-center mb-12"
				>
					<h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">
						Empowering the world&apos;s most innovative brands
					</h2>
				</motion.div>

				<div className="mx-auto grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-3 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
					{LOGOS.map((logo, index) => (
						<motion.div
							key={logo.id}
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 0.6 }}
							whileHover={{ opacity: 1, scale: 1.05 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.1 }}
							className="flex justify-center"
						>
							<div className="relative h-16 w-16 overflow-hidden rounded-sm grayscale transition-all duration-300 hover:grayscale-0">
								<Image
									src={logo.src}
									alt={logo.alt}
									fill
									className="object-cover"
									referrerPolicy="no-referrer"
								/>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
