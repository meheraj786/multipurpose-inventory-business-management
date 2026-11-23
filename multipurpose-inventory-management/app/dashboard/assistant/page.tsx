"use client";

import {
	Bot,
	Package,
	RefreshCw,
	Send,
	Sparkles,
	TrendingUp,
	User,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { type ChatMessage, useChatWithAssistant } from "@/hooks/useAssistant";

const QUICK_PROMPTS = [
	{
		label: "Check Low Stock",
		prompt:
			"Do I have any critical low stock alerts right now, and what should I prioritize reordering?",
		icon: Package,
		variant: "destructive" as const,
	},
	{
		label: "Sales Performance",
		prompt:
			"Based on my recent sales logs, how is my business performing and what are the primary payment methods?",
		icon: TrendingUp,
		variant: "default" as const,
	},
	{
		label: "General Strategy",
		prompt:
			"Give me 3 practical recommendations to improve the inventory turnover rate based on my active products.",
		icon: Sparkles,
		variant: "secondary" as const,
	},
];

type ChatEntry = ChatMessage & { id: string };

const createMessageId = (role: ChatMessage["role"], content: string) => {
	const randomPart =
		typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
			? crypto.randomUUID()
			: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

	return `${role}-${content}-${randomPart}`;
};

export default function AssistantPage() {
	const [input, setInput] = useState("");
	const [history, setHistory] = useState<ChatEntry[]>([]);
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	const { mutate: sendChat, isPending } = useChatWithAssistant();

	useEffect(() => {
		if (scrollAreaRef.current) {
			const scrollContainer = scrollAreaRef.current.querySelector(
				"[data-radix-scroll-area-viewport]",
			);
			if (scrollContainer) {
				scrollContainer.scrollTop = scrollContainer.scrollHeight;
			}
		}
	}, []);

	useEffect(() => {
		if (history.length === 0 || !scrollAreaRef.current) {
			return;
		}

		const scrollContainer = scrollAreaRef.current.querySelector(
			"[data-radix-scroll-area-viewport]",
		);
		if (scrollContainer) {
			scrollContainer.scrollTop = scrollContainer.scrollHeight;
		}
	}, [history.length]);

	const handleSend = (textToSend: string) => {
		if (!textToSend.trim() || isPending) return;

		const userMsg: ChatEntry = {
			role: "user",
			content: textToSend,
			id: createMessageId("user", textToSend),
		};
		const updatedHistory = [...history, userMsg];

		setHistory(updatedHistory);
		setInput("");

		sendChat(
			{
				message: textToSend,
				history: history.map(({ id: _id, ...message }) => message),
			},
			{
				onSuccess: (data) => {
					setHistory((prev) => [
						...prev,
						{
							role: "assistant",
							content: data.response,
							id: createMessageId("assistant", data.response),
						},
					]);
				},
				onError: (error) => {
					setHistory((prev) => [
						...prev,
						{
							role: "assistant",
							content: `An error occurred: ${error.message || "Failed to retrieve suggestion."}`,
							id: createMessageId(
								"assistant",
								`An error occurred: ${error.message || "Failed to retrieve suggestion."}`,
							),
						},
					]);
				},
			},
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleSend(input);
	};

	const clearConversation = () => {
		setHistory([]);
	};

	return (
		<div className="container mx-auto p-4 md:p-6 h-[calc(100vh-4rem)] flex flex-col gap-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
						<Bot className="h-8 w-8 text-primary" />
						Business Assistant
					</h1>
					<p className="text-muted-foreground">
						AI companion compiled with your live stock data, sales, and service
						metrics.
					</p>
				</div>
				{history.length > 0 && (
					<Button
						variant="outline"
						size="sm"
						onClick={clearConversation}
						className="flex items-center gap-2"
					>
						<RefreshCw className="h-4 w-4" />
						Reset Conversation
					</Button>
				)}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
				<div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
					<Card className="flex flex-col h-full">
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<Sparkles className="h-5 w-5 text-purple-500" />
								Quick Actions
							</CardTitle>
							<CardDescription>
								Click on any template to query your live database metrics.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3 flex-1 overflow-y-auto">
							{QUICK_PROMPTS.map((item) => {
								const IconComponent = item.icon;
								return (
									<button
										type="button"
										key={item.label}
										onClick={() => handleSend(item.prompt)}
										disabled={isPending}
										className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-all flex flex-col gap-2 disabled:opacity-50"
									>
										<div className="flex items-center gap-2">
											<IconComponent className="h-4 w-4 text-primary" />
											<span className="font-semibold text-sm">
												{item.label}
											</span>
										</div>
										<p className="text-xs text-muted-foreground line-clamp-2">
											&ldquo;{item.prompt}&rdquo;
										</p>
									</button>
								);
							})}
						</CardContent>
					</Card>
				</div>

				<Card className="lg:col-span-3 flex flex-col h-full min-h-0">
					<CardHeader className="border-b py-3 px-6">
						<div className="flex justify-between items-center">
							<div className="flex items-center gap-2">
								<Badge
									variant="outline"
									className="bg-primary/5 text-primary border-primary/20"
								>
									<span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 inline-block animate-ping" />
									Live Database Connected
								</Badge>
							</div>
						</div>
					</CardHeader>

					<CardContent className="flex-1 overflow-hidden p-0">
						<ScrollArea ref={scrollAreaRef} className="h-full px-6 py-4">
							<div className="space-y-6">
								{history.length === 0 ? (
									<div className="flex flex-col items-center justify-center text-center h-[300px] gap-3">
										<Avatar className="h-16 w-16 border bg-primary/5">
											<AvatarFallback className="text-primary font-bold">
												<Bot className="h-8 w-8" />
											</AvatarFallback>
										</Avatar>
										<div>
											<h3 className="font-semibold text-lg">
												Your Personal Business Assistant
											</h3>
											<p className="text-sm text-muted-foreground max-w-sm mt-1">
												I have secure context access to your categories,
												products, inventory shortages, and invoice records.
											</p>
										</div>
									</div>
								) : (
									history.map((msg) => (
										<div
											key={msg.id}
											className={`flex gap-3 ${
												msg.role === "user" ? "flex-row-reverse" : "flex-row"
											}`}
										>
											<Avatar className="h-8 w-8 border shrink-0">
												<AvatarFallback
													className={
														msg.role === "user"
															? "bg-primary text-primary-foreground"
															: "bg-muted text-muted-foreground"
													}
												>
													{msg.role === "user" ? (
														<User className="h-4 w-4" />
													) : (
														<Bot className="h-4 w-4" />
													)}
												</AvatarFallback>
											</Avatar>
											<div
												className={`rounded-lg px-4 py-2 text-sm max-w-[80%] whitespace-pre-wrap leading-relaxed ${
													msg.role === "user"
														? "bg-primary text-primary-foreground shadow"
														: "bg-muted text-muted-foreground border"
												}`}
											>
												{msg.role === "assistant" ? (
													<div className="prose prose-sm dark:prose-invert max-w-none">
														<ReactMarkdown remarkPlugins={[remarkGfm]}>
															{msg.content}
														</ReactMarkdown>
													</div>
												) : (
													<div>{msg.content}</div>
												)}
											</div>
										</div>
									))
								)}

								{isPending && (
									<div className="flex gap-3">
										<Avatar className="h-8 w-8 border shrink-0">
											<AvatarFallback className="bg-muted text-muted-foreground">
												<Bot className="h-4 w-4" />
											</AvatarFallback>
										</Avatar>
										<div className="bg-muted text-muted-foreground border rounded-lg px-4 py-2 text-sm max-w-[80%] flex items-center gap-2">
											<span className="flex gap-1">
												<span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
												<span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
												<span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" />
											</span>
											Compiling database metrics...
										</div>
									</div>
								)}
							</div>
						</ScrollArea>
					</CardContent>

					<Separator />
					<div className="p-4">
						<form onSubmit={handleSubmit} className="flex gap-2">
							<Input
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Ask about inventory, critical stock, or sales performance..."
								disabled={isPending}
								className="flex-1 focus-visible:ring-1 focus-visible:ring-primary"
								autoComplete="off"
							/>
							<Button
								type="submit"
								disabled={isPending || !input.trim()}
								size="icon"
							>
								<Send className="h-4 w-4" />
								<span className="sr-only">Send Message</span>
							</Button>
						</form>
					</div>
				</Card>
			</div>
		</div>
	);
}
