import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthUser } from "@/validation/auth.schema";

interface AuthState {
	user: AuthUser | null;
	setAuth: (user: AuthUser | null) => void;
	clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			setAuth: (user) => set({ user }),
			clearAuth: () => set({ user: null }),
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
