"use client";

import Autoplay from "embla-carousel-autoplay";
import { motion } from "motion/react";
import Image from "next/image";
import React from "react";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";

const SCREENSHOTS = [
	{
		id: 1,
		src: "https://res.cloudinary.com/dlrycnxnh/image/upload/v1773536963/Product_Inventory_List_-_Dark_Mode_gakxsm.png",
		alt: "Product_Inventory_List",
		title: "Real-time Dashboard",
		description:
			"Product inventory and sales tracking in real-time for efficient management.",
	},
	{
		id: 2,
		src: "https://res.cloudinary.com/dlrycnxnh/image/upload/v1773536936/Supplier_Purchase_History_List_cor1p5.png",
		alt: "Analytics View",
		title: "Supplier_Purchase_History_List_",
		description:
			"Detailed supplier purchase history for accurate inventory management.",
	},
	{
		id: 3,
		src: "https://res.cloudinary.com/dlrycnxnh/image/upload/v1773536932/Profit_Margin_Analysis_Dashboard_q0xkmw.png",
		alt: "Integration Settings",
		title: "Profit_Margin_Analysis_Dashboard",
		description: "Analyze profit margins to optimize your supply chain.",
	},
	{
		id: 4,
		src: "https://res.cloudinary.com/dlrycnxnh/image/upload/v1773536930/Invoice_Print_Preview_Modal_Overlay_dzhzea.png",
		alt: "Mobile App",
		title: "Invoice",
		description:
			"Generate and send invoices to customers for seamless transactions.",
	},
];

export function ProductShowcase() {
	const plugin = React.useRef(
		Autoplay({ delay: 2000, stopOnInteraction: true }),
	);

	return (
		<section className="bg-white py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-2xl text-center mb-16">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-base font-bold uppercase tracking-widest text-[#90A1B9] "
					>
						Product Showcase
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.1 }}
						className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl"
					>
						Everything you need to <br /> scale your operations.
					</motion.p>
				</div>

				<div className="relative px-3 md:px-0">
					<Carousel
						opts={{
							align: "start",
							loop: true,
						}}
						plugins={[plugin.current]}
						onMouseEnter={plugin.current.stop}
						onMouseLeave={plugin.current.reset}
						className="w-full"
					>
						<CarouselContent className="-ml-4">
							{SCREENSHOTS.map((item) => (
								<CarouselItem
									key={item.id}
									className="pl-4 md:basis-1/2 lg:basis-1/1"
								>
									<div className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 shadow-2xl shadow-slate-200/50">
										<div className="relative aspect-[16/10] w-full">
											<Image
												src={item.src}
												alt={item.alt}
												fill
												className="object-cover object-top transition-transform duration-500 hover:scale-105"
												referrerPolicy="no-referrer"
											/>
										</div>
										<div className="p-8">
											<h3 className="text-xl font-bold text-slate-900">
												{item.title}
											</h3>
											<p className="mt-2 text-slate-500">{item.description}</p>
										</div>
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
						<div className="hidden sm:block">
							<CarouselPrevious className="-left-12 h-12 w-12 border-slate-200 text-slate-900 hover:bg-slate-50" />
							<CarouselNext className="-right-12 h-12 w-12 border-slate-200 text-slate-900 hover:bg-slate-50" />
						</div>
					</Carousel>
				</div>
			</div>
		</section>
	);
}
