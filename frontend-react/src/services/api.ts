/**
 * API Service Layer — connects to the FastAPI backend.
 *
 * All endpoints proxy through Next.js rewrites: /api/* → http://localhost:8000/api/*
 */

import type { TableInfo, QualityReport } from "@/types";

const API_BASE = "/api";

// ── Generic fetch wrapper ──────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
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

// ── Generic fetch with abort support ──────────────────────

async function apiFetchAbortable<T>(
  path: string,
  options?: RequestInit & { signal?: AbortSignal }
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
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

// ── Database ───────────────────────────────────────────────

export async function fetchTables(): Promise<TableInfo[]> {
  return apiFetch<TableInfo[]>("/tables");
}

export async function fetchTableData(
  tableName: string,
  limit: number = 100
): Promise<{ columns: string[]; data: Record<string, unknown>[] }> {
  const res = await apiFetch<{ columns: string[]; data: Record<string, unknown>[]; rowCount: number }>(
    `/tables/${encodeURIComponent(tableName)}?limit=${limit}`
  );
  return { columns: res.columns, data: res.data };
}

export interface PaginatedData {
  columns: string[];
  data: Record<string, unknown>[];
  page: number;
  pageSize: number;
  totalRows: number;
  hasMore: boolean;
}

export async function fetchTableDataPaginated(
  tableName: string,
  page: number = 0,
  pageSize: number = 200
): Promise<PaginatedData> {
  return apiFetch<PaginatedData>(
    `/tables/${encodeURIComponent(tableName)}/data?page=${page}&page_size=${pageSize}`
  );
}

export async function fetchTableSchema(
  tableName: string
): Promise<{ name: string; dtype: string; nullable: boolean; uniqueCount: number }[]> {
  return apiFetch(`/tables/${encodeURIComponent(tableName)}/schema`);
}

export async function deleteTable(tableName: string): Promise<void> {
  await apiFetch(`/tables/${encodeURIComponent(tableName)}`, { method: "DELETE" });
}

export async function renameTable(tableName: string, newName: string): Promise<void> {
  await apiFetch(`/table/${encodeURIComponent(tableName)}/rename`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ new_name: newName }),
  });
}

// ── SQL Query ──────────────────────────────────────────────

export interface QueryResult {
  queryId: number;
  sql: string;
  columns: string[];
  data: Record<string, unknown>[];
  rowCount: number;
  totalRows?: number;
  hasMore?: boolean;
  truncated?: boolean;
  runtimeMs: number;
  status: "success" | "error";
  error: string | null;
}

export async function executeQuery(
  sql: string,
  limit: number = 10000,
  signal?: AbortSignal
): Promise<QueryResult> {
  return apiFetchAbortable<QueryResult>("/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql, limit }),
    signal,
  });
}

export async function fetchQueryHistory(limit: number = 50): Promise<
  { id: number; sql: string; status: "success" | "error"; runtimeMs: number; rowCount: number; error: string | null; timestamp: string }[]
> {
  return apiFetch(`/query/history?limit=${limit}`);
}

// ── Query Explain ──────────────────────────────────────────

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

export async function explainQuery(sql: string): Promise<ExplainResult> {
  return apiFetch<ExplainResult>("/query/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  });
}

// ── Query Cancel ───────────────────────────────────────────

export async function cancelQuery(queryId: number): Promise<{ cancelled: boolean; queryId: number }> {
  return apiFetch("/query/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query_id: queryId }),
  });
}

// ── Query Export ───────────────────────────────────────────

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

// ── Schema for Autocomplete ────────────────────────────────

export async function fetchAllSchemas(): Promise<Record<string, string[]>> {
  return apiFetch<Record<string, string[]>>("/query/schema");
}

// ── File Upload ────────────────────────────────────────────

export async function uploadFile(
  file: File
): Promise<{ tableName: string; rowCount: number; columnCount: number }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiFetch<{ tableName: string; rowCount: number; columnCount: number; status: string }>(
    "/upload",
    { method: "POST", body: formData }
  );
  return { tableName: res.tableName, rowCount: res.rowCount, columnCount: res.columnCount };
}

// ── Quality ────────────────────────────────────────────────

export async function fetchQualityReport(
  tableName: string
): Promise<QualityReport> {
  return apiFetch<QualityReport>(`/quality/${encodeURIComponent(tableName)}`);
}

// ── Status ─────────────────────────────────────────────────

export async function fetchStatus(): Promise<{
  api: string;
  db: string;
  rag: string;
  version: string;
  uptime: string;
}> {
  return apiFetch("/status");
}
