/**
 * API Service Layer — connects to the FastAPI backend.
 *
 * Non-streaming endpoints proxy through Next.js rewrites: /api/* → http://localhost:8000/api/*
 * Streaming (SSE) endpoints connect directly to backend to avoid Next.js proxy timeout.
 */

import type { QualityReport, AnomalyResult } from "@/types";
import { API_BASE, apiFetch } from "@/services/api/http-client";
export type { AIStatus, SystemStatusResponse } from "@/services/api/status";
export { fetchAIStatus, fetchStatus } from "@/services/api/status";
export type { PaginatedData } from "@/services/api/tables";
export {
  deleteTable,
  fetchTableData,
  fetchTableDataPaginated,
  fetchTableSchema,
  fetchTables,
  renameTable,
} from "@/services/api/tables";

// Direct backend URL for SSE streaming (bypasses Next.js proxy 30s timeout)
export const DIRECT_BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Generic fetch wrapper ──────────────────────────────────

// ── Database ───────────────────────────────────────────────

/**
 * Fetch all table metadata from the database.
 * @returns Array of table info objects
 * @throws {Error} API 4xx/5xx errors
 */
// ── SQL Query ──────────────────────────────────────────────

export interface QueryResult {
  queryId: number;
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

/**
 * Execute a SQL query against the database.
 * @param sql - SQL query string
 * @param offset - Pagination offset (default 0)
 * @param limit - Max rows to return (default 10000)
 * @param signal - Optional AbortSignal for cancellation
 * @returns Query result with columns, data, and metadata
 * @throws {Error} API 4xx/5xx errors, SQL syntax errors
 */
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

/**
 * Upload a CSV or Excel file to the database.
 * @param file - File object to upload
 * @returns Upload result with table name, row count, and column count
 * @throws {Error} API 4xx/5xx errors, invalid file format
 */
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

// ── AI Status ───────────────────────────────────────────────────

// ── AI Analysis ─────────────────────────────────────────────────

export interface FollowUpContext {
  previous_sql?: string;
  previous_result_schema?: { name: string; dtype: string }[];
  previous_sample_rows?: Record<string, unknown>[];
  previous_insight_summary?: string;
  prior_key_findings?: string[];
  investigation_summary?: string;
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

/**
 * Convert natural language question to SQL and optionally execute.
 * @param question - Natural language question
 * @param execute - Whether to execute the generated SQL (default true)
 * @param explain - Whether to explain the results (default true)
 * @param followUpContext - Optional context from prior conversation
 * @param language - Language code for AI response (default "zh")
 * @returns AI query result with SQL, data, and explanation
 * @throws {Error} API 4xx/5xx errors, AI service errors
 */
export async function aiQuery(
  question: string,
  execute: boolean = true,
  explain: boolean = true,
  followUpContext?: FollowUpContext,
  language?: string
): Promise<AIQueryResult> {
  const body: Record<string, unknown> = { question, execute, explain };
  if (followUpContext) body.follow_up_context = followUpContext;
  if (language) body.language = language;
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
  conversationHistory?: { role: string; content: string }[],
  language?: string
): Promise<{ explanation: string; status: string }> {
  const body: Record<string, unknown> = { question, sql, results };
  if (conversationHistory) body.conversation_history = conversationHistory;
  if (language) body.language = language;
  return apiFetch("/ai/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * Generate AI insights from query results.
 * @param question - Original question for context
 * @param results - Query result data rows
 * @param language - Language code for AI response
 * @param priorContext - Optional prior analysis context
 * @returns Insights, trends, and suggested next steps
 * @throws {Error} API 4xx/5xx errors, AI service errors
 */
export async function aiInsights(
  question: string,
  results: Record<string, unknown>[],
  language?: string,
  priorContext?: string
): Promise<{ insights: (string | { text: string; confidence?: number; severity?: string; impact?: string; category?: string; evidence_score?: number })[]; trends: (string | { text: string; confidence?: number })[]; suggested_next_steps: string[]; filtered_insights_count?: number }> {
  const body: Record<string, unknown> = { question, results };
  if (language) body.language = language;
  if (priorContext) body.prior_context = priorContext;
  return apiFetch("/ai/insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Streaming API ─────────────────────────────────────────────

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
}

export interface GenericStreamCallbacks {
  onEvent: (data: Record<string, unknown>) => void;
  onDone: (data?: Record<string, unknown>) => void;
  onError: (err: Error) => void;
}

function consumeSseStreamGeneric(createResponse: (signal: AbortSignal) => Promise<Response>, callbacks: GenericStreamCallbacks, timeoutMs = 120_000, maxRetries = 2): AbortController {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let retryCount = 0;
  let receivedEvents = false;

  const resetTimeout = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      controller.abort();
      callbacks.onError(new Error(`Stream timeout after ${timeoutMs / 1000}s of inactivity`));
    }, timeoutMs);
  };

  const tryConnect = () => {
    resetTimeout();
    createResponse(controller.signal).then(async (res) => {
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        callbacks.onError(new Error(`API ${res.status}: ${body || res.statusText}`));
        return;
      }
      if (!res.body) {
        callbacks.onError(new Error("Response body is null"));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let doneReceived = false;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          resetTimeout();
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "done") { doneReceived = true; if (timeoutId) clearTimeout(timeoutId); callbacks.onDone(data); return; }
                else if (data.type === "error") { doneReceived = true; if (timeoutId) clearTimeout(timeoutId); callbacks.onError(new Error(data.error || "Unknown error")); return; }
                else { receivedEvents = true; callbacks.onEvent(data); }
              } catch {
                // Skip malformed SSE line
              }
            }
          }
        }
        if (timeoutId) clearTimeout(timeoutId);
        // Drain remaining buffer after stream ends
        buffer += decoder.decode();
        if (buffer.trim()) {
          for (const line of buffer.split("\n")) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "done") { doneReceived = true; callbacks.onDone(data); }
                else if (data.type === "error") { doneReceived = true; callbacks.onError(new Error(data.error || "Unknown error")); }
                else { receivedEvents = true; callbacks.onEvent(data); }
              } catch {
                // Skip malformed SSE line
              }
            }
          }
        }
        // Stream ended without explicit "done" event — signal completion anyway
        if (!doneReceived) {
          if (receivedEvents) {
            callbacks.onDone();
          } else {
            callbacks.onError(new Error("Stream ended without completion signal"));
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          // Retry on connection reset if no events received yet
          if (!receivedEvents && retryCount < maxRetries) {
            retryCount++;
            console.warn(`[SSE] Stream failed, retrying (${retryCount}/${maxRetries})...`);
            setTimeout(tryConnect, 1000 * retryCount); // Exponential backoff
          } else {
            callbacks.onError(err instanceof Error ? err : new Error("Stream failed"));
          }
        }
      }
    }).catch((err) => {
      if (err.name !== "AbortError") {
        // Retry on fetch error if no events received yet
        if (!receivedEvents && retryCount < maxRetries) {
          retryCount++;
          console.warn(`[SSE] Connection failed, retrying (${retryCount}/${maxRetries})...`);
          setTimeout(tryConnect, 1000 * retryCount);
        } else {
          callbacks.onError(err);
        }
      }
    });
  };

  tryConnect();
  return controller;
}

function consumeSseStream(createResponse: (signal: AbortSignal) => Promise<Response>, callbacks: StreamCallbacks, timeoutMs = 60_000, maxRetries = 2): AbortController {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let retryCount = 0;
  let receivedChunks = false;

  const resetTimeout = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      controller.abort();
      callbacks.onError(new Error(`Stream timeout after ${timeoutMs / 1000}s of inactivity`));
    }, timeoutMs);
  };

  const tryConnect = () => {
    resetTimeout();
    createResponse(controller.signal).then(async (res) => {
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        callbacks.onError(new Error(`API ${res.status}: ${body || res.statusText}`));
        return;
      }
      if (!res.body) {
        callbacks.onError(new Error("Response body is null"));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let doneReceived = false;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          resetTimeout();
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "text") { receivedChunks = true; callbacks.onChunk(data.content); }
                else if (data.type === "done") { doneReceived = true; if (timeoutId) clearTimeout(timeoutId); callbacks.onDone(); return; }
                else if (data.type === "error") { doneReceived = true; if (timeoutId) clearTimeout(timeoutId); callbacks.onError(new Error(data.error)); return; }
              } catch {
                // Skip malformed SSE line
              }
            }
          }
        }
        if (timeoutId) clearTimeout(timeoutId);
        // Drain remaining buffer after stream ends
        buffer += decoder.decode();
        if (buffer.trim()) {
          for (const line of buffer.split("\n")) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "text") { receivedChunks = true; callbacks.onChunk(data.content); }
                else if (data.type === "done") { doneReceived = true; callbacks.onDone(); }
                else if (data.type === "error") { doneReceived = true; callbacks.onError(new Error(data.error)); }
              } catch {
                // Skip malformed SSE line
              }
            }
          }
        }
        // Stream ended without explicit "done" event — signal completion anyway
        if (!doneReceived) {
          if (receivedChunks) {
            callbacks.onDone();
          } else {
            callbacks.onError(new Error("Stream ended without completion signal"));
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          // Retry on connection reset if no chunks received yet
          if (!receivedChunks && retryCount < maxRetries) {
            retryCount++;
            console.warn(`[SSE] Stream failed, retrying (${retryCount}/${maxRetries})...`);
            setTimeout(tryConnect, 1000 * retryCount);
          } else {
            callbacks.onError(err instanceof Error ? err : new Error("Stream failed"));
          }
        }
      }
    }).catch((err) => {
      if (err.name !== "AbortError") {
        // Retry on fetch error if no chunks received yet
        if (!receivedChunks && retryCount < maxRetries) {
          retryCount++;
          console.warn(`[SSE] Connection failed, retrying (${retryCount}/${maxRetries})...`);
          setTimeout(tryConnect, 1000 * retryCount);
        } else {
          callbacks.onError(err);
        }
      }
    });
  };

  tryConnect();
  return controller;
}

/**
 * Stream AI explanation of query results via SSE.
 * @param question - Original question
 * @param sql - SQL query that produced results
 * @param results - Query result data rows
 * @param callbacks - Stream event callbacks (onChunk, onDone, onError)
 * @param conversationHistory - Optional prior conversation turns
 * @param language - Language code for AI response
 * @returns AbortController for cancellation
 */
export function streamAiExplain(
  question: string,
  sql: string,
  results: Record<string, unknown>[],
  callbacks: StreamCallbacks,
  conversationHistory?: { role: string; content: string }[],
  language?: string
): AbortController {
  const body: Record<string, unknown> = { question, sql, results };
  if (conversationHistory) body.conversation_history = conversationHistory;
  if (language) body.language = language;
  // Direct connection to backend for SSE streaming (bypasses Next.js proxy timeout)
  return consumeSseStream(
    (signal) => fetch(`${DIRECT_BACKEND}/api/ai/explain/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    }),
    callbacks,
  );
}

export function streamAiInsights(
  question: string,
  results: Record<string, unknown>[],
  callbacks: StreamCallbacks,
  language?: string,
  priorContext?: string
): AbortController {
  const body: Record<string, unknown> = { question, results };
  if (language) body.language = language;
  if (priorContext) body.prior_context = priorContext;
  // Direct connection to backend for SSE streaming (bypasses Next.js proxy timeout)
  return consumeSseStream(
    (signal) => fetch(`${DIRECT_BACKEND}/api/ai/insights/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    }),
    callbacks,
  );
}

export async function aiChartSuggest(
  results: Record<string, unknown>[],
  question: string = "",
  language?: string
): Promise<{ recommended_charts: { type: string; title: string; x_axis: string; y_axis: string; reason: string }[] }> {
  const body: Record<string, unknown> = { results, question };
  if (language) body.language = language;
  return apiFetch("/ai/chart-suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Semantic Dataset Understanding ─────────────────────────────

export interface ColumnSemantics {
  name: string;
  dtype: string;
  semantic_role: "identifier" | "metric" | "dimension" | "datetime" | "text";
  business_meaning: string;
  is_kpi?: boolean;
  is_measure?: boolean;
  is_time_column?: boolean;
  is_entity_id?: boolean;
  aggregation_hint?: string | null;
  is_metric: boolean;
  is_dimension: boolean;
}

export interface DatasetSemantics {
  summary: string;
  columns: ColumnSemantics[];
  detected_kpis?: string[];
  detected_measures?: string[];
  detected_time_columns?: string[];
  detected_entities?: string[];
  detected_metrics: string[];
  detected_dimensions: string[];
  suggested_focus: string;
  status: string;
  elapsed_ms?: number;
}

/**
 * Analyze dataset semantics - detect KPIs, dimensions, measures, etc.
 * @param table - Table name
 * @param columns - Column names and types
 * @param sampleRows - Sample data rows for context
 * @param language - Language code for AI response
 * @returns Semantic analysis with detected roles and business meanings
 * @throws {Error} API 4xx/5xx errors, AI service errors
 */
export async function aiSemantics(
  table: string,
  columns: { name: string; dtype: string }[],
  sampleRows: Record<string, unknown>[],
  language?: string
): Promise<DatasetSemantics> {
  const body: Record<string, unknown> = { table, columns, sample_rows: sampleRows };
  if (language) body.language = language;
  return apiFetch<DatasetSemantics>("/ai/semantics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Smart Suggested Questions ──────────────────────────────────

export interface SuggestedQuestion {
  question: string;
  category: "overview" | "comparison" | "trend" | "breakdown" | "anomaly";
  reason: string;
}

/**
 * Get AI-suggested questions for a dataset.
 * @param table - Table name
 * @param profile - Dataset profile with statistics
 * @param semantics - Optional semantic analysis results
 * @param language - Language code for AI response
 * @returns Suggested questions with categories and reasons
 * @throws {Error} API 4xx/5xx errors, AI service errors
 */
export async function aiSuggestQuestions(
  table: string,
  profile: Record<string, unknown>,
  semantics?: Record<string, unknown>,
  language?: string
): Promise<{ questions: SuggestedQuestion[]; status: string }> {
  const body: Record<string, unknown> = { table, profile };
  if (semantics) body.semantics = semantics;
  if (language) body.language = language;
  return apiFetch("/ai/suggest-questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Analysis Planning ──────────────────────────────────────────

export interface PlanStep {
  step: number;
  purpose: string;
  sql_goal: string;
  depends_on: number | null;
}

export interface AnalysisPlan {
  plan: PlanStep[];
  status: string;
  elapsed_ms?: number;
  error?: string;
}

/**
 * Generate an analysis plan for a question.
 * @param question - Analysis question
 * @param table - Table name
 * @param columns - Column names and types
 * @param sampleRows - Sample data rows
 * @param language - Language code for AI response
 * @returns Analysis plan with ordered steps
 * @throws {Error} API 4xx/5xx errors, AI service errors
 */
export async function aiGeneratePlan(
  question: string,
  table: string,
  columns: { name: string; dtype: string }[],
  sampleRows: Record<string, unknown>[],
  language?: string
): Promise<AnalysisPlan> {
  const body: Record<string, unknown> = { question, table, columns, sample_rows: sampleRows };
  if (language) body.language = language;
  return apiFetch<AnalysisPlan>("/ai/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Multi-step Analysis ────────────────────────────────────────

export interface MultiStepExecuted {
  step: number;
  purpose: string;
  sql: string;
  columns: string[];
  data: Record<string, unknown>[];
  row_count?: number;
  error?: string;
  status: "success" | "error";
}

export interface MultiStepResult {
  question: string;
  plan: PlanStep[];
  steps: MultiStepExecuted[];
  summary: string;
  status: string;
  elapsed_ms?: number;
  error?: string;
}

export async function aiAnalyzeMulti(
  question: string,
  table: string,
  columns: { name: string; dtype: string }[],
  sampleRows: Record<string, unknown>[],
  language?: string,
  maxRows: number = 500
): Promise<MultiStepResult> {
  const body: Record<string, unknown> = { question, table, columns, sample_rows: sampleRows, max_rows: maxRows };
  if (language) body.language = language;
  return apiFetch<MultiStepResult>("/ai/analyze-multi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Multi-step Streaming ───────────────────────────────────────

export type MultiStreamEventType = "plan" | "step_start" | "step_result" | "step_retry" | "summary" | "error" | "done";

export interface MultiStreamEvent {
  type: MultiStreamEventType;
  plan?: PlanStep[];
  step?: number;
  purpose?: string;
  attempt?: number;
  sql?: string;
  columns?: string[];
  data?: Record<string, unknown>[];
  row_count?: number;
  error?: string;
  status?: "success" | "error";
  summary?: string;
  elapsed_ms?: number;
  trace?: Record<string, unknown>;
  token_budget?: Record<string, unknown>;
  guardrail_violations?: string[];
}

export interface MultiStreamCallbacks {
  onPlan: (plan: PlanStep[]) => void;
  onStepStart: (step: number, purpose: string) => void;
  onStepRetry: (step: number, attempt: number, error: string) => void;
  onStepResult: (event: MultiStreamEvent) => void;
  onSummary: (summary: string) => void;
  onError: (err: Error) => void;
  onDone: (data?: MultiStreamEvent) => void;
}

/**
 * Stream multi-step autonomous analysis via SSE.
 * @param question - Analysis question
 * @param table - Table name
 * @param columns - Column names and types
 * @param sampleRows - Sample data rows
 * @param callbacks - Stream event callbacks (onPlan, onStepStart, onStepResult, onSummary, onError, onDone)
 * @param language - Language code for AI response
 * @param maxRows - Max rows per step (default 500)
 * @param priorFindings - Optional prior findings to avoid duplication
 * @returns AbortController for cancellation
 */
export function streamAiAnalyzeMulti(
  question: string,
  table: string,
  columns: { name: string; dtype: string }[],
  sampleRows: Record<string, unknown>[],
  callbacks: MultiStreamCallbacks,
  language?: string,
  maxRows: number = 500,
  priorFindings?: string[]
): AbortController {
  const body: Record<string, unknown> = { question, table, columns, sample_rows: sampleRows, max_rows: maxRows };
  if (language) body.language = language;
  if (priorFindings?.length) body.prior_findings = priorFindings;

  // Direct connection to backend for SSE streaming (bypasses Next.js proxy timeout)
  return consumeSseStreamGeneric(
    (signal) => fetch(`${DIRECT_BACKEND}/api/ai/analyze-multi/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    }),
    {
      onEvent: (data) => {
        const type = data.type as string;
        if (type === "plan" && data.plan) callbacks.onPlan(data.plan as PlanStep[]);
        else if (type === "step_start" && data.step != null) callbacks.onStepStart(data.step as number, (data.purpose as string) || "");
        else if (type === "step_retry" && data.step != null) callbacks.onStepRetry(data.step as number, (data.attempt as number) || 2, (data.error as string) || "");
        else if (type === "step_result") callbacks.onStepResult(data as unknown as MultiStreamEvent);
        else if (type === "summary" && data.summary != null) callbacks.onSummary(data.summary as string);
      },
      onDone: (data) => callbacks.onDone(data as unknown as MultiStreamEvent),
      onError: callbacks.onError,
    }
  );
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
  insights?: (string | { text: string; confidence?: number; severity?: string; impact?: string; category?: string })[];
  trends?: (string | { text: string; confidence?: number })[];
  data_quality_notes?: string[];
  suggested_next_steps?: string[];
  chart_suggestions: { type: string; title: string; x_axis: string; y_axis: string; reason: string }[];
  data?: Record<string, unknown>[];
  elapsed_ms: number;
  status: string;
}

export async function analyzeTable(tableName: string, language?: string): Promise<AnalysisResult> {
  const query = language ? `?language=${encodeURIComponent(language)}` : "";
  return apiFetch<AnalysisResult>(`/analyze/${encodeURIComponent(tableName)}${query}`, {
    method: "POST",
  });
}

export async function getTableProfile(tableName: string): Promise<{ table: string; profile: AnalysisProfile; status: string }> {
  return apiFetch(`/analyze/${encodeURIComponent(tableName)}/profile`);
}

// ── Template Adaptation ────────────────────────────────────────

export interface AdaptedQuestion {
  order: number;
  question: string;
  status: "ok" | "unadaptable";
  reason?: string;
}

export async function aiAdaptTemplate(
  templateSteps: { question: string; mode: string; order: number }[],
  originalColumns: { name: string; dtype: string }[],
  targetTable: string,
  targetColumns: { name: string; dtype: string }[],
  language?: string,
): Promise<{ adapted_questions: AdaptedQuestion[]; status: string }> {
  return apiFetch("/ai/adapt-template", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      template_steps: templateSteps,
      original_columns: originalColumns,
      target_table: targetTable,
      target_columns: targetColumns,
      language: language || "zh",
    }),
  });
}

// ── Report Generation ──────────────────────────────────────────

export interface ReportOptions {
  title?: string;
  includeTrace?: boolean;
  includeDataSamples?: boolean;
  language?: string;
}

export async function generateReport(
  runs: unknown[],
  options?: ReportOptions,
): Promise<{ markdown: string; status: string }> {
  return apiFetch("/ai/generate-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      runs,
      options: {
        title: options?.title ?? "Analysis Report",
        include_trace: options?.includeTrace ?? false,
        include_data_samples: options?.includeDataSamples ?? true,
        language: options?.language ?? "zh",
      },
    }),
  });
}

// ── Analysis Comparison ─────────────────────────────────────────

export interface CompareResult {
  run_a_id: string;
  run_b_id: string;
  summary: {
    sections_added: number;
    sections_removed: number;
    sections_changed: number;
    sections_unchanged: number;
    sql_changed: boolean;
    has_metrics_delta: boolean;
  };
  sections_diff: Array<{ title: string; change: string; old_content: string | null; new_content: string | null }>;
  sql_diff: { old: string | null; new: string | null; changed: boolean };
  metrics_diff: Record<string, { old: number; new: number; delta: number }>;
}

export async function compareRuns(runA: unknown, runB: unknown): Promise<CompareResult> {
  return apiFetch("/ai/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ run_a: runA, run_b: runB }),
  });
}

// ── Analysis Bundle ──────────────────────────────────────────────

export async function exportBundle(runs: unknown[], name: string): Promise<{ version: string; name: string; created_at: string; runs: unknown[]; metadata: Record<string, unknown>; status: string }> {
  return apiFetch("/ai/bundle/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ runs, name }),
  });
}

export async function importBundle(bundle: unknown): Promise<{ runs: unknown[]; metadata: Record<string, unknown>; status: string }> {
  return apiFetch("/ai/bundle/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bundle }),
  });
}

// ── AI Self-Evaluation ──────────────────────────────────────────

export interface EvaluationResult {
  confidence: number;
  completeness: string;
  accuracy: string;
  actionability: string;
  diagnostics: string[];
  suggested_improvements: string[];
  status: string;
  quality_gates?: {
    passed: boolean;
    warnings: string[];
    checks_run: string[];
  };
}

export async function aiEvaluate(
  question: string,
  sections: unknown[],
  trace?: unknown,
  language?: string,
): Promise<EvaluationResult> {
  return apiFetch("/ai/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      sections,
      trace,
      language: language || "zh",
    }),
  });
}

// ── Scheduled Analysis ──────────────────────────────────────────

export async function createSchedule(data: {
  name: string;
  question: string;
  table: string;
  columns: unknown[];
  sample_rows: unknown[];
  interval: string;
  language?: string;
}): Promise<{ task_id: string; status: string }> {
  return apiFetch("/ai/schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, language: data.language || "zh" }),
  });
}

export async function listSchedules(): Promise<{ tasks: unknown[] }> {
  return apiFetch("/ai/schedule");
}

export async function deleteSchedule(taskId: string): Promise<{ status: string }> {
  return apiFetch(`/ai/schedule/${taskId}`, { method: "DELETE" });
}

export async function toggleSchedule(taskId: string, enabled: boolean): Promise<{ status: string }> {
  return apiFetch(`/ai/schedule/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });
}

export async function getScheduleResults(taskId: string): Promise<{ results: unknown[] }> {
  return apiFetch(`/ai/schedule/${taskId}/results`);
}

// ── Anomaly Detection ──────────────────────────────────────────

/**
 * Detect anomalies in query results.
 * @param question - Original question for context
 * @param results - Query result data rows
 * @param columns - Optional specific columns to analyze
 * @param method - Detection method ("auto", "iqr", "zscore", etc.)
 * @param language - Language code for AI response
 * @returns Anomaly detection results with interpretations
 * @throws {Error} API 4xx/5xx errors, AI service errors
 */
export async function aiDetectAnomalies(
  question: string,
  results: Record<string, unknown>[],
  columns?: string[],
  method: string = "auto",
  language?: string
): Promise<AnomalyResult> {
  const body: Record<string, unknown> = { question, results, method };
  if (columns) body.columns = columns;
  if (language) body.language = language;
  return apiFetch<AnomalyResult>("/ai/anomalies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export interface AnomalyStreamCallbacks {
  onDetection: (data: AnomalyResult) => void;
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
}

/**
 * Stream anomaly detection via SSE.
 * @param question - Original question for context
 * @param results - Query result data rows
 * @param callbacks - Stream event callbacks (onDetection, onChunk, onDone, onError)
 * @param columns - Optional specific columns to analyze
 * @param method - Detection method ("auto", "iqr", "zscore", etc.)
 * @param language - Language code for AI response
 * @returns AbortController for cancellation
 */
export function streamAiDetectAnomalies(
  question: string,
  results: Record<string, unknown>[],
  callbacks: AnomalyStreamCallbacks,
  columns?: string[],
  method: string = "auto",
  language?: string
): AbortController {
  const body: Record<string, unknown> = { question, results, method };
  if (columns) body.columns = columns;
  if (language) body.language = language;

  // Direct connection to backend for SSE streaming (bypasses Next.js proxy timeout)
  return consumeSseStreamGeneric(
    (signal) => fetch(`${DIRECT_BACKEND}/api/ai/anomalies/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    }),
    {
      onEvent: (data) => {
        const type = data.type as string;
        if (type === "detection") callbacks.onDetection(data.data as unknown as AnomalyResult);
        else if (type === "text") callbacks.onChunk((data.content as string) || "");
      },
      onDone: () => callbacks.onDone(),
      onError: callbacks.onError,
    }
  );
}
