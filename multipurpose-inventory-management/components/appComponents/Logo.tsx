import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.png";

const Logo = ({ text = true }) => {
	return (
		<Link href="/" className="flex items-center gap-2 group">
			<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white ">
				<Image
					src={logo}
					alt="Logo"
					width={32}
					height={32}
					className="h-8 w-8 transition-transform group-hover:scale-105 rounded-full"
				/>
			</div>
			{text && (
				<span className="text-xl font-bold tracking-tight text-slate-900">
					Sell-Tech Suite
				</span>
			)}
		</Link>
	);
};

export default Logo;
