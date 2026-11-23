"use client";

import {
	Box,
	CircleHelpIcon,
	DatabaseIcon,
	FileChartColumnIcon,
	FileIcon,
	FileTextIcon,
	GitGraph,
	LayoutDashboardIcon,
	Leaf,
	ListIcon,
	Pizza,
	SearchIcon,
	Settings2Icon,
	Trash,
	UserCheck,
	UsersIcon,
} from "lucide-react";
import type * as React from "react";
import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import Logo from "./appComponents/Logo";

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: <LayoutDashboardIcon />,
		},
		{
			title: "Sales",
			url: "/dashboard/sales",
			icon: <FileChartColumnIcon />,
		},
		{
			title: "Products",
			url: "/dashboard/products",
			icon: <Box />,
		},
		{
			title: "Purchases",
			url: "/dashboard/purchases",
			icon: <ListIcon />,
		},
		{
			title: "Suppliers",
			url: "/dashboard/suppliers",
			icon: <UsersIcon />,
		},
		{
			title: "Customers",
			url: "/dashboard/customers",
			icon: <UserCheck />,
		},
		{
			title: "Services",
			url: "/dashboard/services",
			icon: <UserCheck />,
		},
		{
			title: "Raw Products",
			url: "/dashboard/raw-products",
			icon: <Leaf />,
		},
		{
			title: "Prepared Products",
			url: "/dashboard/prepared-products",
			icon: <Pizza />,
		},
	],
	navClouds: [
		{
			title: "Staff",
			icon: <UsersIcon />,
			isActive: true,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
		{
			title: "Proposal",
			icon: <FileTextIcon />,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
		{
			title: "Stock Setting",
			icon: <GitGraph />,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
	],
	navSecondary: [
		{
			title: "Settings",
			url: "#",
			icon: <Settings2Icon />,
		},
		{
			title: "Get Help",
			url: "#",
			icon: <CircleHelpIcon />,
		},
		{
			title: "Search",
			url: "#",
			icon: <SearchIcon />,
		},
	],
	documents: [
		// {
		// 	name: "Staff",
		// 	icon: <UsersIcon />,
		// 	url: "/dashboard/staff",
		// },
		{
			name: "Inventory Setting",
			url: "/dashboard/inventory-setting",
			icon: <DatabaseIcon />,
		},
		{
			name: "Categories",
			url: "/dashboard/categories",
			icon: <FileIcon />,
		},
		{
			name: "Subcategory",
			url: "/dashboard/subCategories",
			icon: <FileIcon />,
		},
		{
			name: "Trash",
			url: "/dashboard/trash",
			icon: <Trash />,
		},
		{
			name: "Activity Logs",
			url: "/dashboard/activityLog",
			icon: <FileTextIcon />,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:p-1.5!"
						>
							<Logo />
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavDocuments items={data.documents} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
