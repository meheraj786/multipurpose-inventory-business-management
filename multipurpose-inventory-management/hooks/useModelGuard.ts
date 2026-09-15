"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";

type Feature = "retail" | "service" | "restaurant" | "admin";

const MODEL_FEATURES: Record<string, Feature[]> = {
	RETAIL: ["retail"],
	SERVICE: ["service"],
	RESTAURANT: ["restaurant"],
	RETAIL_AND_SERVICE: ["retail", "service"],
	SERVICE_AND_RESTAURANT: ["service", "restaurant"],
	RETAIL_AND_RESTAURANT: ["retail", "restaurant"],
	RETAIL_AND_SERVICE_AND_RESTAURANT: ["retail", "service", "restaurant"],
};

export function useModelGuard(requiredFeature: Feature) {
	const router = useRouter();
	const user = useAuthStore((s) => s.user);

	useEffect(() => {
		if (!user) return;

		const isAdmin = user.role === "ADMIN" || user.role === "DEVELOPER";
		const model = user.account?.model ?? "";
		const features = MODEL_FEATURES[model] ?? [];

		if (requiredFeature === "admin" && !isAdmin) {
			router.replace("/dashboard");
			return;
		}

		if (requiredFeature !== "admin" && !features.includes(requiredFeature)) {
			router.replace("/dashboard");
		}
	}, [user, requiredFeature, router]);
}
