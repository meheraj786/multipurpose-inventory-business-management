import { Footer } from "@/components/appComponents/Footer";
import Header from "@/components/appComponents/Header";

export default function LandingPageLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<Header />
			<div className="pt-10">
				{children}
				<Footer />
			</div>
		</>
	);
}
