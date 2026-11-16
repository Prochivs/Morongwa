import type { ApiResponse } from "@queuemate/shared";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://morongwa.vercel.app/api/v1";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
  }
}

type Options = RequestInit & { token?: string | null; timeoutMs?: number };

export async function apiFetch<T>(path: string, options: Options = {}): Promise<T> {
  const { token, timeoutMs = 25_000, ...requestOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const headers = new Headers(requestOptions.headers);
  if (token) headers.set("authorization", `Bearer ${token}`);
  if (requestOptions.body && !(requestOptions.body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  try {
    const response = await fetch(`${API_URL}${path}`, { ...requestOptions, headers, signal: controller.signal });
    const payload = await response.json().catch(() => null) as ApiResponse<T> | null;
    if (!response.ok || !payload?.success) {
      const failure = payload && !payload.success
        ? payload.error
        : { code: "NETWORK_ERROR", message: "Unable to complete the request" };
      throw new ApiError(failure.code, failure.message, response.status, failure.details);
    }
    return payload.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) throw new ApiError("REQUEST_TIMEOUT", "This is taking longer than expected. Check your connection and try again.", 408);
    throw new ApiError("NETWORK_ERROR", "We could not reach QueueMate. Check your connection and try again.", 0);
  } finally {
    clearTimeout(timeout);
  }
}
