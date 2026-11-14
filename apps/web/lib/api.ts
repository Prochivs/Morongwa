import type { ApiResponse } from "@queuemate/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number, public details?: unknown) { super(message); }
}

type ApiFetchOptions = RequestInit & { timeoutMs?: number };

function getCsrfToken() {
  if (typeof document === "undefined") return undefined;
  return document.cookie.split("; ").find((row) => row.startsWith("qm_csrf="))?.split("=")[1];
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { timeoutMs = 30_000, signal, ...requestOptions } = options;
  const method = (requestOptions.method ?? "GET").toUpperCase();
  const headers = new Headers(requestOptions.headers);
  if (!(requestOptions.body instanceof FormData) && requestOptions.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) headers.set("x-csrf-token", decodeURIComponent(csrf));
  }
  const controller = new AbortController();
  let timedOut = false;
  const timeout = window.setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener("abort", abortFromCaller, { once: true });
  if (signal?.aborted) controller.abort();
  try {
    const response = await fetch(`${API_URL}${path}`, { ...requestOptions, headers, signal: controller.signal, credentials: "include", cache: "no-store" });
    const payload = await response.json().catch(() => null) as ApiResponse<T> | null;
    if (!response.ok || !payload?.success) {
      const error = payload && !payload.success ? payload.error : { code: "NETWORK_ERROR", message: "Unable to complete the request" };
      throw new ApiError(error.code, error.message, response.status, error.details);
    }
    return payload.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (timedOut) throw new ApiError("REQUEST_TIMEOUT", "This is taking longer than expected. Check your connection and try again.", 408);
    if (signal?.aborted) throw error;
    throw new ApiError("NETWORK_ERROR", "We could not reach QueueMate. Check your connection and try again.", 0);
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}
