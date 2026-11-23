"use client";

import { Calculator, Delete, Plus, ShoppingCart, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function SpeedDial() {
	const [open, setOpen] = React.useState(false);
	const [isCalcOpen, setIsCalcOpen] = React.useState(false);
	const [display, setDisplay] = React.useState("0");
	const [equation, setEquation] = React.useState("");
	const [clearOnNext, setClearOnNext] = React.useState(false);
	const [isFinished, setIsFinished] = React.useState(false);
	const router = useRouter();

	const handleInput = React.useCallback(
		(val: string) => {
			if (isFinished) {
				setDisplay(val);
				setEquation(val);
				setIsFinished(false);
				setClearOnNext(false);
				return;
			}

			if (clearOnNext) {
				setDisplay(val);
				setEquation(equation + val);
				setClearOnNext(false);
				return;
			}

			if (display === "0" && val !== ".") {
				setDisplay(val);
				setEquation(equation.slice(0, -1) + val || val);
			} else {
				setDisplay(display + val);
				setEquation(equation + val);
			}
		},
		[display, equation, clearOnNext, isFinished],
	);

	const handleOperator = React.useCallback(
		(op: string) => {
			setIsFinished(false);
			if (!equation) {
				setEquation(display + op);
				setClearOnNext(true);
				return;
			}

			const lastChar = equation.slice(-1);
			if (["+", "-", "*", "/"].includes(lastChar)) {
				setEquation(equation.slice(0, -1) + op);
				return;
			}

			setEquation(equation + op);
			setClearOnNext(true);
		},
		[display, equation],
	);

	const handleClear = React.useCallback(() => {
		setDisplay("0");
		setEquation("");
		setClearOnNext(false);
		setIsFinished(false);
	}, []);

	const handleBackspace = React.useCallback(() => {
		if (isFinished) {
			handleClear();
			return;
		}

		if (display.length > 1) {
			setDisplay(display.slice(0, -1));
			setEquation(equation.slice(0, -1));
		} else {
			setDisplay("0");
			setEquation(equation.slice(0, -1));
		}
	}, [display, equation, isFinished, handleClear]);

	const handleCalculate = React.useCallback(() => {
		if (!equation) return;
		try {
			const sanitized = equation.replace(/[^-+*/.0-9]/g, "");
			const evalResult = new Function(`return ${sanitized}`)();
			const resultString = String(evalResult);
			setDisplay(resultString);
			setEquation(resultString);
			setIsFinished(true);
			setClearOnNext(false);
		} catch {
			setDisplay("Error");
			setEquation("");
			setIsFinished(true);
			setClearOnNext(false);
		}
	}, [equation]);

	React.useEffect(() => {
		if (!isCalcOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			const { key } = e;
			if (/[0-9]/.test(key)) {
				e.preventDefault();
				handleInput(key);
			} else if (key === ".") {
				e.preventDefault();
				handleInput(".");
			} else if (["+", "-", "*", "/"].includes(key)) {
				e.preventDefault();
				handleOperator(key);
			} else if (key === "Enter" || key === "=") {
				e.preventDefault();
				handleCalculate();
			} else if (key === "Backspace") {
				e.preventDefault();
				handleBackspace();
			} else if (key === "Escape" || key === "c" || key === "C") {
				e.preventDefault();
				handleClear();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		isCalcOpen,
		handleInput,
		handleOperator,
		handleCalculate,
		handleBackspace,
		handleClear,
	]);

	return (
		<nav
			aria-label="Speed Dial"
			className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-center gap-3 pointer-events-auto"
			onMouseEnter={() => setOpen(true)}
			onMouseLeave={() => setOpen(false)}
		>
			<Button
				size="icon"
				className="rounded-full h-12 w-12 shadow-lg hover:shadow-xl transition-all duration-300"
				onClick={() => setOpen(!open)}
			>
				<Plus
					className={cn(
						"h-6 w-6 transition-transform duration-300",
						open && "rotate-45",
					)}
				/>
			</Button>

			<div
				className={cn(
					"flex flex-col gap-3 transition-all duration-300 origin-bottom",
					open
						? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
						: "opacity-0 translate-y-4 scale-95 pointer-events-none h-0 overflow-hidden",
				)}
			>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="icon"
								variant="secondary"
								className="rounded-full h-10 w-10 shadow border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
								onClick={() => {
									router.push("/dashboard/sales/create");
									setOpen(false);
								}}
							>
								<ShoppingCart className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
							</Button>
						</TooltipTrigger>
						<TooltipContent
							side="left"
							sideOffset={12}
							className="text-xs font-semibold"
						>
							Create Sale
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="icon"
								variant="secondary"
								className="rounded-full h-10 w-10 shadow border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
								onClick={() => {
									router.push("/dashboard/assistant");
									setOpen(false);
								}}
							>
								<Sparkles className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
							</Button>
						</TooltipTrigger>
						<TooltipContent
							side="left"
							sideOffset={12}
							className="text-xs font-semibold"
						>
							AI Assistant
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="icon"
								variant="secondary"
								className="rounded-full h-10 w-10 shadow border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
								onClick={() => {
									setIsCalcOpen(true);
									setOpen(false);
								}}
							>
								<Calculator className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
							</Button>
						</TooltipTrigger>
						<TooltipContent
							side="left"
							sideOffset={12}
							className="text-xs font-semibold"
						>
							Calculator
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>

			<Dialog open={isCalcOpen} onOpenChange={setIsCalcOpen}>
				<DialogContent className="max-w-[340px] p-6 rounded-2xl gap-4 border border-neutral-200 dark:border-neutral-800">
					<DialogHeader>
						<DialogTitle className="text-sm font-semibold tracking-tight text-neutral-500">
							Business Calculator
						</DialogTitle>
					</DialogHeader>

					<div className="flex flex-col gap-3">
						<div className="flex flex-col items-end justify-end p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border text-right min-h-[80px]">
							<span className="text-xs text-neutral-400 font-mono overflow-x-auto max-w-full">
								{equation || "0"}
							</span>
							<span className="text-2xl font-bold font-mono tracking-tight text-neutral-800 dark:text-neutral-100 overflow-x-auto max-w-full mt-1">
								{display}
							</span>
						</div>

						<div className="grid grid-cols-4 gap-2">
							<Button
								variant="outline"
								className="h-12 text-sm font-semibold text-red-500 hover:text-red-600 font-mono"
								onClick={handleClear}
							>
								C
							</Button>
							<Button
								variant="outline"
								className="h-12 text-sm font-semibold font-mono"
								onClick={handleBackspace}
							>
								<Delete className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								className="h-12 text-sm font-semibold font-mono"
								onClick={() => handleOperator("/")}
							>
								/
							</Button>
							<Button
								variant="outline"
								className="h-12 text-sm font-semibold font-mono"
								onClick={() => handleOperator("*")}
							>
								*
							</Button>

							<Button
								variant="outline"
								className="h-12 text-sm font-semibold font-mono"
								onClick={() => handleInput("7")}
							>
								7
							</Button>
							<Button
								variant="outline"
								className="h-12 text-sm font-semibold font-mono"
								onClick={() => handleInput("8")}
							>
								8
							</Button>
							<Button
								variant="outline"
								className="h-12 text-sm font-semibold font-mono"
								onClick={() => handleInput("9")}
							>
								9
							</Button>
							<Button
								variant="outline"
								className="h-12 text-sm font-semibold font-mono"
								onClick={() => handleOperator("-")}
							>
								-
							</Button>

							<Button
								variant="outline"
								className="h-12 text-sm font-semibold font-mono"
								onClick={() => handleInput("4")}
							>
								4
							</Button>
							<Button
								variant="outline"
								className="h-12 text-sm font-semibold font-mono"
								onClick={() => handleInput("5")}
							>
								5
							</Button>
							<Button
								variant="outline"
								className="h-12 text-sm font-semibold font-mono"
								onClick={() => handleInput("6")}
							>
								6
							</Button>
							<Button
								variant="outline"
								className="h-12 text-sm font-semibold font-mono"
								onClick={() => handleOperator("+")}
							>
								+
							</Button>

							<div className="col-span-3 grid grid-cols-3 gap-2">
								<Button
									variant="outline"
									className="h-12 text-sm font-semibold font-mono"
									onClick={() => handleInput("1")}
								>
									1
								</Button>
								<Button
									variant="outline"
									className="h-12 text-sm font-semibold font-mono"
									onClick={() => handleInput("2")}
								>
									2
								</Button>
								<Button
									variant="outline"
									className="h-12 text-sm font-semibold font-mono"
									onClick={() => handleInput("3")}
								>
									3
								</Button>

								<Button
									variant="outline"
									className="col-span-2 h-12 text-sm font-semibold font-mono"
									onClick={() => handleInput("0")}
								>
									0
								</Button>
								<Button
									variant="outline"
									className="h-12 text-sm font-semibold font-mono"
									onClick={() => handleInput(".")}
								>
									.
								</Button>
							</div>

							<Button
								className="h-full text-base font-bold bg-primary font-mono text-primary-foreground hover:bg-primary/95"
								onClick={handleCalculate}
							>
								=
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</nav>
	);
}
