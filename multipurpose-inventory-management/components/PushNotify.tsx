"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
	sendNotification,
	subscribeUser,
	unsubscribeUser,
} from "@/app/actions";

type StatusType = "success" | "error";

interface Status {
	type: StatusType;
	message: string;
}

// interface SerializedPushSubscription {
// 	endpoint: string;
// 	expirationTime: number | null;
// 	keys: {
// 		p256dh: string;
// 		auth: string;
// 	};
// }

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; i++) {
		outputArray[i] = rawData.charCodeAt(i);
	}

	return outputArray;
}

// function serializeSubscription(
// 	sub: PushSubscription,
// ): SerializedPushSubscription {
// 	const json = sub.toJSON();
// 	return {
// 		endpoint: sub.endpoint,
// 		expirationTime: sub.expirationTime,
// 		keys: {
// 			p256dh: json.keys?.p256dh ?? "",
// 			auth: json.keys?.auth ?? "",
// 		},
// 	};
// }

function BellIcon() {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height={16}
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			viewBox="0 0 24 24"
			width={16}
		>
			<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
			<path d="M13.73 21a2 2 0 0 1-3.46 0" />
		</svg>
	);
}

function CheckIcon() {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height={13}
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2.5}
			viewBox="0 0 24 24"
			width={13}
		>
			<polyline points="20 6 9 17 4 12" />
		</svg>
	);
}

interface StatusBannerProps {
	status: Status;
}

function StatusBanner({ status }: StatusBannerProps) {
	const isSuccess = status.type === "success";

	return (
		<div
			className={[
				"flex items-center gap-2.5 px-4 py-3 text-xs font-mono tracking-wide border-b",
				isSuccess
					? "bg-neutral-50 text-neutral-600 border-neutral-100"
					: "bg-red-50 text-red-600 border-red-100",
			].join(" ")}
		>
			<span
				className={[
					"w-1.5 h-1.5 rounded-full flex-shrink-0",
					isSuccess ? "bg-neutral-500" : "bg-red-500",
				].join(" ")}
			/>
			{status.message}
		</div>
	);
}

export function PushNotificationManager() {
	const [isSupported, setIsSupported] = useState(false);
	const [subscription, setSubscription] = useState<PushSubscription | null>(
		null,
	);
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [status, setStatus] = useState<Status | null>(null);

	const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const showStatus = useCallback((type: StatusType, msg: string) => {
		if (statusTimerRef.current) {
			clearTimeout(statusTimerRef.current);
		}
		setStatus({ type, message: msg });
		statusTimerRef.current = setTimeout(() => setStatus(null), 5000);
	}, []);

	const registerServiceWorker = useCallback(async () => {
		try {
			const registration = await navigator.serviceWorker.register("/sw.js", {
				scope: "/",
				updateViaCache: "none",
			});
			const existing = await registration.pushManager.getSubscription();
			setSubscription(existing);
		} catch (err) {
			console.error("[PushNotificationManager] SW registration failed:", err);
		}
	}, []);

	useEffect(() => {
		if ("serviceWorker" in navigator && "PushManager" in window) {
			setIsSupported(true);
			void registerServiceWorker();
		}
	}, [registerServiceWorker]);

	useEffect(() => {
		return () => {
			if (statusTimerRef.current) {
				clearTimeout(statusTimerRef.current);
			}
		};
	}, []);
	async function subscribeToPush() {
		setIsLoading(true);
		setStatus(null);

		try {
			const registration = await navigator.serviceWorker.ready;

			const sub = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(
					process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
				),
			});

			setSubscription(sub);
			const serializedSub = JSON.parse(JSON.stringify(sub));
			await subscribeUser(serializedSub);

			setStatus({
				type: "success",
				message: "✅ Push notifications enabled successfully on this device!",
			});
		} catch (err: unknown) {
			console.error("Subscribe Error Details:", err);

			let errorMessage = "Failed to enable push notifications.";

			const error = err as { name: string; message: string };

			if (
				error.name === "NotAllowedError" ||
				error.message.includes("permission")
			) {
				errorMessage =
					"❌ Notification permission denied.\nPlease allow notifications from site settings.";
			} else if (error.name === "AbortError") {
				errorMessage =
					"❌ Subscription was aborted.\nPlease install the app to Home Screen first, then try again.";
			} else if (error.name === "InvalidStateError") {
				errorMessage =
					"❌ Invalid state.\nTry refreshing the page or reinstalling the PWA.";
			} else if (
				error.message.includes("VAPID") ||
				error.message.includes("applicationServerKey")
			) {
				errorMessage =
					"❌ VAPID key error.\nPlease check your environment variables.";
			} else if (
				error.message.includes("network") ||
				error.message.includes("fetch")
			) {
				errorMessage =
					"❌ Network error.\nPlease check your internet connection.";
			} else {
				errorMessage = `❌ ${error.message || "Unknown error occurred"}`;
			}

			setStatus({
				type: "error",
				message: errorMessage,
			});
		} finally {
			setIsLoading(false);
		}
	}

	const unsubscribeFromPush = useCallback(async () => {
		if (!subscription) return;

		setIsLoading(true);

		try {
			await subscription.unsubscribe();
			await unsubscribeUser();
			setSubscription(null);
			showStatus("success", "Push notifications disabled");
		} catch (err) {
			console.error("[PushNotificationManager] Unsubscribe failed:", err);
			showStatus("error", "Failed to disable notifications");
		} finally {
			setIsLoading(false);
		}
	}, [subscription, showStatus]);

	const sendTestNotification = useCallback(async () => {
		const trimmed = message.trim();

		if (!subscription || !trimmed) {
			showStatus("error", "Enter a message first");
			return;
		}

		setIsLoading(true);

		try {
			await sendNotification(trimmed);
			showStatus("success", "Test notification sent");
			setMessage("");
		} catch (err) {
			console.error("[PushNotificationManager] Send failed:", err);
			showStatus("error", "Failed to send notification");
		} finally {
			setIsLoading(false);
		}
	}, [message, subscription, showStatus]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") {
				void sendTestNotification();
			}
		},
		[sendTestNotification],
	);

	if (!isSupported) {
		return (
			<div className="fixed bottom-4 right-4 z-50 w-[340px] bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden">
				<div className="bg-neutral-900 px-5 py-4 flex items-center gap-3">
					<div className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-white">
						<BellIcon />
					</div>
					<div>
						<p className="text-white text-sm font-semibold tracking-wide font-mono">
							Notifications
						</p>
						<p className="text-white/40 text-[10px] tracking-widest font-mono uppercase">
							Push Manager
						</p>
					</div>
				</div>
				<div className="px-5 py-5">
					<p className="text-xs text-neutral-500 leading-relaxed">
						Push notifications are not supported in this browser.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed bottom-4 right-4 z-50 w-[340px] bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden">
			{/* Header */}
			<div className="bg-neutral-900 px-5 py-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div
						className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-white"
						aria-hidden="true"
					>
						<BellIcon />
					</div>
					<div>
						<p className="text-white text-sm font-semibold tracking-wide font-mono">
							Notifications
						</p>
						<p className="text-white/40 text-[10px] tracking-widest font-mono uppercase">
							Push Manager
						</p>
					</div>
				</div>

				{/* Active indicator */}
				<div
					aria-label={subscription ? "Active" : "Inactive"}
					className={[
						"w-2 h-2 rounded-full transition-colors duration-500",
						subscription ? "bg-white" : "bg-neutral-600",
					].join(" ")}
					role="img"
				/>
			</div>

			{/* Status banner */}
			{status ? <StatusBanner status={status} /> : null}

			{/* Body */}
			{subscription ? (
				<div>
					{/* Subscribed pill */}
					<div className="px-5 py-4 flex items-center gap-2.5 border-b border-neutral-100">
						<span className="w-1.5 h-1.5 rounded-full bg-neutral-900 flex-shrink-0" />
						<p className="text-[11px] text-neutral-500 font-mono tracking-widest uppercase">
							Active — subscribed
						</p>
					</div>

					{/* Test message */}
					<div className="px-5 py-5 space-y-4">
						<div>
							<p className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase mb-2">
								Send test message
							</p>
							<div className="flex gap-2">
								<label htmlFor="push-message" className="sr-only">
									Test notification message
								</label>
								<input
									id="push-message"
									className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3.5 py-2.5 text-[13px] text-neutral-900 placeholder:text-neutral-400 font-mono outline-none focus:border-neutral-400 focus:ring-0 transition-colors"
									disabled={isLoading}
									onChange={(e) => setMessage(e.target.value)}
									onKeyDown={handleKeyDown}
									placeholder="Type a message…"
									type="text"
									value={message}
								/>
								<button
									aria-label="Send test notification"
									className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 text-white rounded-lg px-4 py-2.5 text-[11px] font-mono tracking-widest uppercase transition-all active:scale-95 flex items-center gap-1.5"
									disabled={isLoading || !message.trim()}
									onClick={() => void sendTestNotification()}
									type="button"
								>
									{isLoading ? (
										<span className="animate-pulse">…</span>
									) : (
										<>
											<CheckIcon />
											Send
										</>
									)}
								</button>
							</div>
						</div>

						<button
							className="w-full border border-neutral-200 hover:border-neutral-400 text-neutral-400 hover:text-neutral-700 rounded-lg py-2.5 text-[11px] font-mono tracking-widest uppercase transition-all active:scale-[0.98] disabled:opacity-40"
							disabled={isLoading}
							onClick={() => void unsubscribeFromPush()}
							type="button"
						>
							{isLoading ? "Disabling…" : "Disable Notifications"}
						</button>
					</div>
				</div>
			) : (
				<div className="px-5 py-6 space-y-5">
					<p className="text-[13px] text-neutral-500 leading-relaxed">
						Stay updated with important alerts — even when you&apos;re not
						browsing the site.
					</p>
					<button
						className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white rounded-xl py-3.5 text-[11px] font-mono tracking-widest uppercase transition-all active:scale-[0.98] shadow-sm"
						disabled={isLoading}
						onClick={() => void subscribeToPush()}
						type="button"
					>
						{isLoading ? "Enabling…" : "Enable Notifications"}
					</button>
					<p className="text-center text-[10px] text-neutral-400 font-mono tracking-wide">
						No spam. Unsubscribe any time.
					</p>
				</div>
			)}
		</div>
	);
}
