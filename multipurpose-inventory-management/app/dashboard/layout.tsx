"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "@/components/appComponents/Sidebar";
import { SpeedDial } from "@/components/SpeedDial";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useRouteGuard } from "@/hooks/useRouteGuard";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [collapsed, setCollapsed] = useState(false);
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	// Enforce route guards on the client side
	useRouteGuard();

	return (
		<div className="flex h-screen overflow-hidden bg-background">
			{/* Desktop Sidebar (hidden on mobile) */}
			<div className="hidden lg:block border-r">
				<Sidebar collapsed={collapsed} />
			</div>

			<div className="flex flex-1 flex-col overflow-hidden">
				{/* Topbar */}
				<header className="flex h-14 shrink-0 items-center justify-between border-b px-4 bg-white">
					<div className="flex items-center gap-2">
						{/* Mobile Menu Trigger */}
						<div className="lg:hidden">
							<Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
								<SheetTrigger asChild>
									<Button variant="ghost" size="icon">
										<Menu className="h-5 w-5" />
									</Button>
								</SheetTrigger>
								<SheetContent side="left" className="p-0 w-64">
									<Sidebar onNavItemClick={() => setIsMobileOpen(false)} />
								</SheetContent>
							</Sheet>
						</div>

						{/* Desktop Collapse Toggle */}
						<Button
							variant="ghost"
							size="icon"
							className="hidden lg:flex"
							onClick={() => setCollapsed((c) => !c)}
						>
							{collapsed ? (
								<PanelLeftOpen className="h-4 w-4" />
							) : (
								<PanelLeftClose className="h-4 w-4" />
							)}
						</Button>

						<h2 className="text-sm font-semibold lg:hidden">Sell-Tech Suite</h2>
					</div>

					<div className="flex items-center gap-4">
						{/* Add Notification or Profile dropdown here if needed */}
					</div>
				</header>

				{/* Page content */}
				<main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 lg:p-8">
					{children}
					<SpeedDial />
				</main>
			</div>
		</div>
	);
}
