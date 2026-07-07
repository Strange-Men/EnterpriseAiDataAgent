const DIRECT_BACKEND = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

/** @deprecated Use DIRECT_BACKEND + path directly for consistent cross-env behavior. */
const API_BASE = "/api";

export { API_BASE, DIRECT_BACKEND };

/**
 * Build an absolute API URL that works in every environment:
 *  - localhost dev  → http://localhost:8000/api/...
 *  - Vercel prod    → https://enterpriseaidataagent.onrender.com/api/...
 *
 * If `path` already starts with "/api/", it is used as-is.
 * Otherwise "/api" is prepended (backward-compatible with callers that
 * historically relied on API_BASE = "/api").
 */
export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const fullPath = normalizedPath.startsWith("/api/") ? normalizedPath : `/api${normalizedPath}`;
  return `${DIRECT_BACKEND}${fullPath}`;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { signal?: AbortSignal; timeoutMs?: number }
): Promise<T> {
  const { timeoutMs, ...fetchOptions } = options ?? {};
  const signal = fetchOptions.signal ?? AbortSignal.timeout(timeoutMs ?? 60_000);
  const url = apiUrl(path);
  const res = await fetch(url, {
    ...fetchOptions,
    signal,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  try {
    return await res.json();
  } catch {
    const text = await res.text().catch(() => "");
    throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
  }
}
