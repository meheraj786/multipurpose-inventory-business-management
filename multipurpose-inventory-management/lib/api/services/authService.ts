import Cookies from "js-cookie";
import type {
	ApiResponse,
	AuthUser,
	LoginInput,
	RegisterInput,
} from "@/validation/auth.schema";
import { loginSchema, registerSchema } from "@/validation/auth.schema";
import api from "../client";

const isProd = process.env.NODE_ENV === "production";

const cookieOptions: Cookies.CookieAttributes = {
	secure: isProd,
	sameSite: isProd ? "None" : "Lax",
};

const storeTokens = (
	accessToken: string,
	refreshToken: string,
	user?: AuthUser,
) => {
	Cookies.set("accessToken", accessToken, {
		...cookieOptions,
		expires: 1 / 96,
	});
	Cookies.set("refreshToken", refreshToken, { ...cookieOptions, expires: 7 });

	// Store user metadata for middleware access
	if (user) {
		Cookies.set("userRole", user.role, { ...cookieOptions, expires: 7 });
		Cookies.set("userModel", user.account?.model || "", {
			...cookieOptions,
			expires: 7,
		});
		// Store permissions as CSV for middleware access
		if (user.permissions && user.permissions.length > 0) {
			const permModules = user.permissions.map((p) => p.module).join(",");
			Cookies.set("userPermissions", permModules, {
				...cookieOptions,
				expires: 7,
			});
		}
	}
};

const clearTokens = () => {
	Cookies.remove("accessToken");
	Cookies.remove("refreshToken");
	Cookies.remove("userRole");
	Cookies.remove("userModel");
	Cookies.remove("userPermissions");
};

export const authService = {
	register: async (data: RegisterInput) => {
		const validated = registerSchema.parse(data);
		const response = await api.post("/auth/register", validated);
		return response.data as ApiResponse;
	},

	login: async (data: LoginInput) => {
		const validated = loginSchema.parse(data);
		const response = await api.post("/auth/login", validated);
		const result = response.data as ApiResponse<{
			user: AuthUser;
			accessToken: string;
			refreshToken: string;
		}>;
		const payload = result.data;
		if (!payload) throw new Error("Login response missing data");
		const { user, accessToken, refreshToken } = payload;
		storeTokens(accessToken, refreshToken, user);
		return { user };
	},

	refresh: async () => {
		const refreshToken = Cookies.get("refreshToken");
		const response = await api.post("/auth/refresh", { refreshToken });
		const result = response.data as ApiResponse<{
			accessToken: string;
			refreshToken: string;
			user?: AuthUser;
		}>;
		const payload = result.data;
		if (!payload) throw new Error("Refresh response missing data");
		storeTokens(payload.accessToken, payload.refreshToken, payload.user);
		return result;
	},

	logout: async () => {
		try {
			await api.post("/auth/logout");
		} catch (err) {
			console.error("Logout error:", err);
		} finally {
			clearTokens();
		}
	},

	getMe: async () => {
		const response = await api.get("/auth/me");
		const user = (response.data as ApiResponse<AuthUser>).data;
		// Update cookies with latest user data
		if (user) {
			storeTokens(
				Cookies.get("accessToken") || "",
				Cookies.get("refreshToken") || "",
				user,
			);
		}
		return user;
	},
};
