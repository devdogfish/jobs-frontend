import type { DailyApplicationReport } from "../types/newspaper";

const API_BASE = import.meta.env.VITE_API_BASE || "";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      return { error: "Unauthorized" };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || `HTTP ${response.status}` };
    }

    if (response.status === 204) {
      return { data: undefined as T };
    }

    const data = await response.json();
    return { data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Network error" };
  }
}

export const authApi = {
  login: (password: string) =>
    apiRequest<{ success: boolean }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),

  logout: () =>
    apiRequest<void>("/auth/logout", {
      method: "POST",
    }),

  checkSession: () => apiRequest<{ authenticated: boolean }>("/auth/session"),
};

export const reportApi = {
  getReport: () => apiRequest<DailyApplicationReport>("/job-report"),
};
