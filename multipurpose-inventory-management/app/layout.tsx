import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/providers/QueryProvider";

const geistSans = Plus_Jakarta_Sans({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Inter({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Sell-Tech Suite",
	description: "Sell-Tech Suite App for any business.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Toaster />
				<QueryProvider>{children}</QueryProvider>
			</body>
		</html>
	);
}
