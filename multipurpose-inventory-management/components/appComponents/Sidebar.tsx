"use client";

import { Loader2, LogOut, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/useAuth";
import { resolveNavGroups } from "@/lib/resolveNav";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { cn } from "@/lib/utils";

interface SidebarProps {
	collapsed?: boolean;
	onNavItemClick?: () => void;
}

export function Sidebar({ collapsed = false, onNavItemClick }: SidebarProps) {
	const user = useAuthStore((s) => s.user);
	const navGroups = resolveNavGroups(user);
	const { mutate: logout, isPending: isLoggingOut } = useLogout();
	const pathname = usePathname();

	return (
		<aside
			className={cn(
				"flex h-full flex-col bg-background py-4",
				collapsed ? "w-14" : "w-60",
			)}
		>
			{/* Logo */}
			<div className={cn("mb-6 px-6", collapsed && "px-2 text-center")}>
				<span
					className={cn(
						"font-black tracking-tight text-primary",
						collapsed ? "text-xl" : "text-lg",
					)}
				>
					{collapsed ? "S" : "Sell-Tech Suite"}
				</span>
			</div>

			{/* Nav groups */}
			<nav className="flex-1 space-y-4 overflow-y-auto px-3">
				{navGroups.map((group) => (
					<div key={group.title}>
						{group.title && !collapsed && (
							<p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
								{group.title}
							</p>
						)}
						<div className="space-y-1">
							{group.items.map((item) => {
								const isActive =
									pathname === item.href ||
									pathname.startsWith(`${item.href}/`);
								const Icon = item.icon;

								// Check if current item is the Assistant
								const isAssistant = item.label === "My Assistant";

								return (
									<Link
										key={item.href}
										href={item.href}
										onClick={onNavItemClick}
										className={cn(
											"relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
											// Active link styles
											isActive
												? "bg-primary text-primary-foreground shadow-sm"
												: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
											// Custom inactive assistant styles with purple border
											isAssistant &&
												!isActive &&
												"border border-purple-500/40 bg-purple-500/5 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 hover:text-purple-700",
											// Custom active assistant styles (optional highlights)
											isAssistant && isActive && "border border-purple-500/30",
											collapsed && "justify-center px-2",
										)}
									>
										<Icon
											className={cn(
												"h-4 w-4 shrink-0",
												isAssistant && !isActive && "text-purple-500",
											)}
										/>
										{!collapsed && (
											<span className={cn(isAssistant && "pr-6")}>
												{item.label}
											</span>
										)}

										{/* AI badge inside bottom-right corner when not collapsed */}
										{!collapsed && isAssistant && (
											<span
												className={cn(
													"absolute bottom-0.5 right-1.5 text-[8px] font-black uppercase tracking-wider scale-90",
													isActive
														? "text-primary-foreground/80"
														: "text-purple-600/95 dark:text-purple-400",
												)}
											>
												AI
											</span>
										)}
									</Link>
								);
							})}
						</div>
					</div>
				))}
			</nav>

			{/* Bottom Section: Dropdown Menu */}
			<div className="mt-auto border-t p-3">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className={cn(
								"w-full flex items-center justify-between p-2 h-auto hover:bg-accent focus-visible:ring-0",
								collapsed && "justify-center px-0",
							)}
						>
							{!collapsed && (
								<div className="flex flex-col items-start text-left overflow-hidden mr-2">
									<p className="text-xs font-bold text-foreground truncate w-full">
										{user?.email?.split("@")[0]}
									</p>
									<p className="text-[10px] text-muted-foreground truncate w-full uppercase tracking-tighter">
										{user?.role}
									</p>
								</div>
							)}
							<MoreHorizontal
								className={cn(
									"h-4 w-4 text-muted-foreground shrink-0",
									collapsed && "h-5 w-5",
								)}
							/>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						side={collapsed ? "right" : "top"}
						align={collapsed ? "start" : "end"}
						className="w-56"
					>
						<DropdownMenuLabel className="font-normal">
							<div className="flex flex-col space-y-1">
								<p className="text-sm font-medium leading-none">
									{user?.email}
								</p>
								<p className="text-xs leading-none text-muted-foreground capitalize">
									{user?.account?.model?.toLowerCase().replace(/_/g, " ")}
								</p>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{/* <DropdownMenuItem className="cursor-pointer">
							<User className="mr-2 h-4 w-4" /> Profile
						</DropdownMenuItem>
						<DropdownMenuItem className="cursor-pointer">
							<Settings className="mr-2 h-4 w-4" /> Settings
						</DropdownMenuItem> */}
						{/* <DropdownMenuSeparator /> */}
						<DropdownMenuItem
							className="text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer"
							disabled={isLoggingOut}
							onClick={() => logout()}
						>
							{isLoggingOut ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<LogOut className="mr-2 h-4 w-4" />
							)}
							Logout
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</aside>
	);
}
