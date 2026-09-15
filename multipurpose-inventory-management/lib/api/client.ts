import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { authService } from "./services/authService";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
	_retry?: boolean;
}

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	withCredentials: true,
	timeout: 15000,
});

api.interceptors.request.use((config) => {
	const token = Cookies.get("accessToken");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// api.interceptors.response.use(
// 	(response) => response,
// 	async (error: AxiosError) => {
// 		const originalRequest = error.config as CustomAxiosRequestConfig;

// 		if (
// 			error.response?.status === 401 &&
// 			originalRequest &&
// 			!originalRequest._retry
// 		) {
// 			originalRequest._retry = true;

// 			try {
// 				await authService.refresh();
// 				return api(originalRequest);
// 			} catch (_refreshError) {
// 				Cookies.remove("accessToken");
// 				Cookies.remove("refreshToken");
// 				window.location.href = "/login";
// 			}
// 		}

// 		return Promise.reject(error);
// 	},

// );
api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as CustomAxiosRequestConfig;

		if (
			error.response?.status === 401 &&
			originalRequest &&
			!originalRequest._retry
		) {
			originalRequest._retry = true;

			try {
				await authService.refresh();

				const newToken = Cookies.get("accessToken");
				if (newToken) {
					originalRequest.headers.Authorization = `Bearer ${newToken}`;
				}

				return api(originalRequest);
			} catch (_refreshError) {
				Cookies.remove("accessToken");
				Cookies.remove("refreshToken");
				window.location.href = "/login";
			}
		}

		return Promise.reject(error);
	},
);

export default api;
