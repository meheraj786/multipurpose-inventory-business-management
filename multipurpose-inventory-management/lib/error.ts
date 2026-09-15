import type { AxiosError } from "axios";

export interface ApiErrorResponse {
	message?: string;
	error?: string;
	errors?: Record<string, string[]>;
}

export type ApiError = AxiosError<ApiErrorResponse>;
