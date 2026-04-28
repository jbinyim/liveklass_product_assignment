import { ApiError } from "./ApiError";
import type { ErrorResponse } from "@/app/(enroll)/_shared/api/types";

export interface FetcherOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.code === "string" && typeof v.message === "string";
}

export async function fetcher<T>(
  path: string,
  { method = "GET", body, signal, headers }: FetcherOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    // AbortError는 호출자가 의도적으로 취소한 경우 (React 18 Strict Mode dev 더블 마운트 / 컴포넌트 언마운트 / queryKey 변경).
    // ApiError.network로 감싸지 않고 그대로 throw하면 React Query가 silent하게 처리.
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    if (
      err instanceof Error &&
      (err.name === "AbortError" || err.message?.includes("aborted"))
    ) {
      throw err;
    }
    throw ApiError.network(err instanceof Error ? err.message : undefined);
  }

  if (response.ok) {
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  let parsed: unknown = null;
  try {
    parsed = await response.json();
  } catch {
    throw ApiError.unknown(`HTTP ${response.status}`, response.status);
  }

  if (isErrorResponse(parsed)) {
    throw ApiError.business(parsed, response.status);
  }
  throw ApiError.unknown(`HTTP ${response.status}`, response.status);
}
