"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Loader2, Package, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLogin } from "@/hooks/useAuth";
import { type LoginInput, loginSchema } from "@/validation/auth.schema";

export default function LoginPage() {
	const { mutate: login, isPending } = useLogin();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginInput>({
		resolver: standardSchemaResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = (data: LoginInput) => {
		login(data, {
			onError: (error: { response: { data: { message: string } } }) => {
				toast.error(
					error?.response?.data?.message || "Login failed. Please try again.",
				);
			},
			onSuccess: () => {
				toast.success("Welcome back!");
			},
		});
	};

	return (
		<div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-6 font-sans">
			{/* Logo and Brand */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex flex-col items-center mb-12"
			>
				<div className="h-16 w-16 bg-black rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
					<Package size={32} strokeWidth={2.5} />
				</div>
				<h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
					Sell-Tech Suite
				</h1>
				<p className="text-slate-500 font-medium">
					Inventory management simplified.
				</p>
			</motion.div>

			{/* Login Card */}
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 0.1 }}
				className="w-full max-w-[480px] bg-white rounded-[32px] p-10 shadow-xl shadow-slate-200/60 border border-slate-100"
			>
				<div className="mb-10">
					<h2 className="text-2xl font-bold text-slate-900 mb-2">
						Welcome back
					</h2>
					<p className="text-slate-500">
						Please enter your details to sign in.
					</p>
				</div>

				<form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
					<div className="space-y-2">
						<Label
							htmlFor="email"
							className="text-sm font-bold text-slate-700 ml-1"
						>
							Email Address
						</Label>
						<Input
							id="email"
							type="email"
							placeholder="name@company.com"
							{...register("email")}
							className={`h-14 rounded-xl border-slate-200 bg-slate-50/50 px-4 focus:bg-white transition-all ${
								errors.email ? "border-red-500 focus:ring-red-500" : ""
							}`}
						/>
						{errors.email && (
							<p className="text-xs font-medium text-red-500 ml-1">
								{errors.email.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between ml-1">
							<Label
								htmlFor="password"
								className="text-sm font-bold text-slate-700"
							>
								Password
							</Label>
							<Link
								href="/forgot-password"
								className="text-xs font-bold text-slate-900 hover:underline"
							>
								Forgot Password?
							</Link>
						</div>
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							{...register("password")}
							className={`h-14 rounded-xl border-slate-200 bg-slate-50/50 px-4 focus:bg-white transition-all ${
								errors.password ? "border-red-500 focus:ring-red-500" : ""
							}`}
						/>
						{errors.password && (
							<p className="text-xs font-medium text-red-500 ml-1">
								{errors.password.message}
							</p>
						)}
					</div>

					<div className="flex items-center space-x-3 ml-1">
						<Checkbox id="remember" className="rounded-md border-slate-300" />
						<label
							htmlFor="remember"
							className="text-sm font-medium text-slate-500 cursor-pointer select-none"
						>
							Keep me logged in for 30 days
						</label>
					</div>

					<Button
						type="submit"
						disabled={isPending}
						className="w-full h-14 rounded-2xl bg-black text-white font-bold text-base hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-5 w-5 animate-spin" />
								Signing In...
							</>
						) : (
							"Sign In"
						)}
					</Button>
				</form>

				<div className="relative my-10">
					<div className="absolute inset-0 flex items-center">
						<Separator className="w-full bg-slate-100" />
					</div>
					<div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-slate-400">
						<span className="bg-white px-4">Or continue with</span>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Button
						variant="outline"
						className="h-14 rounded-2xl border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-all"
					>
						<svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
							<title>Google</title>
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
						Google
					</Button>
					<Button
						variant="outline"
						className="h-14 rounded-2xl border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-all"
					>
						<ShieldCheck className="mr-2 h-5 w-5 text-slate-400" />
						SSO
					</Button>
				</div>
			</motion.div>

			{/* Bottom Link */}
			<motion.p
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.3 }}
				className="mt-10 text-sm font-medium text-slate-500"
			>
				Don&apos;t have an account?{" "}
				<Link
					href="/signup"
					className="text-slate-900 font-bold hover:underline"
				>
					Create a free trial
				</Link>
			</motion.p>

			{/* Footer Links */}
			<motion.footer
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.4 }}
				className="mt-24 flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400"
			>
				<Link
					href="/privacy"
					className="hover:text-slate-600 transition-colors"
				>
					Privacy Policy
				</Link>
				<div className="h-1 w-1 rounded-full bg-slate-200" />
				<Link href="/terms" className="hover:text-slate-600 transition-colors">
					Terms of Service
				</Link>
				<div className="h-1 w-1 rounded-full bg-slate-200" />
				<Link
					href="/support"
					className="hover:text-slate-600 transition-colors"
				>
					Support
				</Link>
			</motion.footer>
		</div>
	);
}
