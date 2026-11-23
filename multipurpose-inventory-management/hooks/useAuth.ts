import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authService } from "@/lib/api/services/authService";
import { useAuthStore } from "@/lib/store/useAuthStore";

export const useGetMe = () => {
	const { setAuth } = useAuthStore();
	const query = useQuery({
		queryKey: ["auth", "me"],
		queryFn: authService.getMe,
		staleTime: 5 * 60 * 1000,
		retry: 2,
		enabled: !!Cookies.get("accessToken"),
	});

	useEffect(() => {
		if (query.data) {
			setAuth(query.data);
		}
	}, [query.data, setAuth]);

	return query;
};

export const useLogin = () => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { setAuth } = useAuthStore();

	return useMutation({
		mutationFn: authService.login,
		onSuccess: (data) => {
			queryClient.setQueryData(["auth", "me"], data?.user);
			if (data?.user) {
				setAuth(data.user);
			}
			router.push("/dashboard");
		},
		onError: (error: { response: { data: { message: string } } }) => {
			console.error("Login failed:", error?.response?.data?.message || error);
		},
	});
};

export const useRegister = () => {
	const router = useRouter();

	return useMutation({
		mutationFn: authService.register,
		onSuccess: () => {
			router.push("/login");
		},
	});
};

export const useLogout = () => {
	const queryClient = useQueryClient();
	const router = useRouter();
	const { clearAuth } = useAuthStore();

	return useMutation({
		mutationFn: authService.logout,
		onSuccess: () => {
			queryClient.clear();
			clearAuth();
			router.push("/login");
		},
	});
};

export const useRefreshToken = () => {
	return useMutation({
		mutationFn: authService.refresh,
	});
};
