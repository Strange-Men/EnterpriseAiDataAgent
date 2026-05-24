/**
 * API Service Layer — connects to the FastAPI backend.
 *
 * All endpoints proxy through Next.js rewrites: /api/* → http://localhost:8000/api/*
 */

import type { TableInfo, QualityReport } from "@/types";

const API_BASE = "/api";

// ── Generic fetch wrapper ──────────────────────────────────

async function apiFetch<T>(
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
  return apiFetch<QueryResult>("/query", {
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
  version: string;
  uptime: string;
}> {
  return apiFetch("/status");
}

// ── AI Status ───────────────────────────────────────────────────

export interface AIStatus {
  configured: boolean;
  connection: "ok" | "error" | "not_configured";
  model: string;
  temperature: number;
  base_url: string;
}

export async function fetchAIStatus(): Promise<AIStatus> {
  return apiFetch<AIStatus>("/ai/status");
}

// ── AI Analysis ─────────────────────────────────────────────────

export interface FollowUpContext {
  previous_sql?: string;
  previous_result_schema?: { name: string; dtype: string }[];
  previous_sample_rows?: Record<string, unknown>[];
  previous_insight_summary?: string;
}

export interface AIQueryResult {
  question: string;
  sql: string;
  columns?: string[];
  data?: Record<string, unknown>[];
  rowCount?: number;
  truncated?: boolean;
  explanation?: string;
  status: "success" | "error" | "cannot_answer" | "sql_error";
  error?: string;
  generation_ms?: number;
  execution_error?: string;
  explanation_ms?: number;
}

export async function aiQuery(
  question: string,
  execute: boolean = true,
  explain: boolean = true,
  followUpContext?: FollowUpContext
): Promise<AIQueryResult> {
  const body: Record<string, unknown> = { question, execute, explain };
  if (followUpContext) body.follow_up_context = followUpContext;
  return apiFetch<AIQueryResult>("/ai/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function aiExplain(
  question: string,
  sql: string,
  results: Record<string, unknown>[],
  conversationHistory?: { role: string; content: string }[]
): Promise<{ explanation: string; status: string }> {
  return apiFetch("/ai/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, sql, results, conversation_history: conversationHistory }),
  });
}

export async function aiInsights(
  question: string,
  results: Record<string, unknown>[]
): Promise<{ insights: string[]; trends: string[]; suggested_next_steps: string[] }> {
  return apiFetch("/ai/insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, results }),
  });
}

// ── Streaming API ─────────────────────────────────────────────

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
}

function consumeSseStream(response: Promise<Response>, callbacks: StreamCallbacks): AbortController {
  const controller = new AbortController();
  response.then(async (res) => {
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      callbacks.onError(new Error(`API ${res.status}: ${body || res.statusText}`));
      return;
    }
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.type === "text") callbacks.onChunk(data.content);
            else if (data.type === "done") callbacks.onDone();
            else if (data.type === "error") callbacks.onError(new Error(data.error));
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        callbacks.onError(err instanceof Error ? err : new Error("Stream failed"));
      }
    }
  }).catch((err) => callbacks.onError(err));
  return controller;
}

export function streamAiExplain(
  question: string,
  sql: string,
  results: Record<string, unknown>[],
  callbacks: StreamCallbacks,
  conversationHistory?: { role: string; content: string }[]
): AbortController {
  return consumeSseStream(
    fetch(`${API_BASE}/ai/explain/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, sql, results, conversation_history: conversationHistory }),
    }),
    callbacks,
  );
}

export function streamAiInsights(
  question: string,
  results: Record<string, unknown>[],
  callbacks: StreamCallbacks,
): AbortController {
  return consumeSseStream(
    fetch(`${API_BASE}/ai/insights/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, results }),
    }),
    callbacks,
  );
}

export async function aiChartSuggest(
  results: Record<string, unknown>[],
  question: string = ""
): Promise<{ recommended_charts: { type: string; title: string; x_axis: string; y_axis: string; reason: string }[] }> {
  return apiFetch("/ai/chart-suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ results, question }),
  });
}

// ── Automated Analysis ──────────────────────────────────────────

export interface AnalysisProfile {
  table: string;
  row_count: number;
  column_count: number;
  total_cells: number;
  null_cells: number;
  null_pct: number;
  duplicate_rows: number;
  columns: {
    name: string;
    dtype: string;
    count: number;
    null_count: number;
    null_pct: number;
    unique_count: number;
    stats?: {
      mean: number;
      median: number;
      std: number;
      min: number;
      max: number;
      q25: number;
      q75: number;
    };
    top_values?: { value: string; count: number }[];
  }[];
}

export interface AnalysisResult {
  table: string;
  profile: AnalysisProfile;
  quality: QualityReport;
  ai_summary: string;
  chart_suggestions: { type: string; title: string; x_axis: string; y_axis: string; reason: string }[];
  elapsed_ms: number;
  status: string;
}

export async function analyzeTable(tableName: string): Promise<AnalysisResult> {
  return apiFetch<AnalysisResult>(`/analyze/${encodeURIComponent(tableName)}`, {
    method: "POST",
  });
}

export async function getTableProfile(tableName: string): Promise<{ table: string; profile: AnalysisProfile; status: string }> {
  return apiFetch(`/analyze/${encodeURIComponent(tableName)}/profile`);
}
