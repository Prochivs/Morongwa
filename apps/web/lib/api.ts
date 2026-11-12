import type { ApiResponse } from "@queuemate/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number, public details?: unknown) { super(message); }
}

function getCsrfToken() {
  if (typeof document === "undefined") return undefined;
  return document.cookie.split("; ").find((row) => row.startsWith("qm_csrf="))?.split("=")[1];
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && options.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) headers.set("x-csrf-token", decodeURIComponent(csrf));
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include", cache: "no-store" });
  const payload = await response.json().catch(() => null) as ApiResponse<T> | null;
  if (!response.ok || !payload?.success) {
    const error = payload && !payload.success ? payload.error : { code: "NETWORK_ERROR", message: "Unable to complete the request" };
    throw new ApiError(error.code, error.message, response.status, error.details);
  }
  return payload.data;
}
