import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { getAdminToken } from "../lib/adminAuth";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

type ApiResponse<Data> = {
  data?: Data;
  error?: {
    message?: string;
    details?: unknown;
  };
  message?: string;
};

const http = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const token = getAdminToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function api<Data>(path: string, config?: AxiosRequestConfig) {
  try {
    const response = await http.request<ApiResponse<Data>>({
      url: path,
      ...config,
    });

    if (response.status === 204) {
      return undefined as Data;
    }

    return response.data.data as Data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(formatApiError(error.response?.data) || error.message || "Request failed");
    }

    throw error;
  }
}

function formatApiError(body?: ApiResponse<unknown>) {
  if (!body) {
    return "";
  }

  const issues = Array.isArray(body.error?.details)
    ? body.error.details
        .flatMap((detail) =>
          isIssueGroup(detail) ? detail.issues.map((issue) => issue.message).filter(Boolean) : [],
        )
        .join(" ")
    : "";

  return [body.error?.message, issues, body.message].filter(Boolean).join(" ");
}

function isIssueGroup(value: unknown): value is { issues: Array<{ message: string }> } {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    Array.isArray((value as { issues?: unknown }).issues)
  );
}
