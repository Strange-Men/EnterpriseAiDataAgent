const API_BASE = "/api";

export { API_BASE };

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { signal?: AbortSignal }
): Promise<T> {
  const signal = options?.signal ?? AbortSignal.timeout(60_000);
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
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
