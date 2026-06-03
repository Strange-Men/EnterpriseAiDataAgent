import { API_BASE, apiFetch } from "@/services/api/http-client";

export interface QueryResult {
  queryId: string;
  sql: string;
  columns: string[];
  data: Record<string, unknown>[];
  rowCount: number;
  totalRows?: number;
  offset?: number;
  hasMore?: boolean;
  truncated?: boolean;
  runtimeMs: number;
  status: "success" | "error";
  error: string | null;
}

export interface QueryHistoryItem {
  id: string;
  sql: string;
  status: "success" | "error";
  runtimeMs: number;
  rowCount: number;
  error: string | null;
  timestamp: string;
}

export interface ExplainPlan {
  operator: string;
  detail: string;
}

export interface ExplainResult {
  sql: string;
  plan: ExplainPlan[];
  status: "success" | "error";
  error: string | null;
}

export async function executeQuery(
  sql: string,
  offset: number = 0,
  limit: number = 10000,
  signal?: AbortSignal
): Promise<QueryResult> {
  return apiFetch<QueryResult>("/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql, offset, limit }),
    signal,
  });
}

export async function fetchQueryHistory(limit: number = 50): Promise<QueryHistoryItem[]> {
  return apiFetch(`/query/history?limit=${limit}`);
}

export async function explainQuery(sql: string): Promise<ExplainResult> {
  return apiFetch<ExplainResult>("/query/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  });
}

export async function cancelQuery(queryId: string): Promise<{ cancelled: boolean; queryId: string }> {
  return apiFetch("/query/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query_id: queryId }),
  });
}

export async function exportQueryResult(
  sql: string,
  format: "csv" | "json" | "excel",
  limit: number = 50000
): Promise<Blob> {
  const res = await fetch(`${API_BASE}/query/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql, format, limit }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Export failed: ${body || res.statusText}`);
  }
  return res.blob();
}

export async function fetchAllSchemas(): Promise<Record<string, string[]>> {
  return apiFetch<Record<string, string[]>>("/query/schema");
}
