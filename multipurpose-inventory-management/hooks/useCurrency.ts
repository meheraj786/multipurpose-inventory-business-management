import { useAuthStore } from "@/lib/store/useAuthStore";

const CURRENCY_SYMBOLS: Record<string, string> = {
	USD: "$",
	BDT: "৳",
	EUR: "€",
	GBP: "£",
};

export const useCurrency = () => {
	const { user } = useAuthStore();
	const currencyCode = user?.account?.currency || "USD";
	const symbol = CURRENCY_SYMBOLS[currencyCode] || "$";

	const formatAmount = (amount: number | string) => {
		const num = typeof amount === "string" ? Number(amount) : amount;
		return `${symbol}${num.toLocaleString(undefined, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})}`;
	};

	return {
		symbol,
		currencyCode,
		formatAmount,
	};
};
