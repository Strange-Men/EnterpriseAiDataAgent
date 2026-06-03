import type { AnomalyResult, QualityReport } from "@/types";
import { apiFetch } from "@/services/api/http-client";
import type { AiQualityGate } from "@/services/api/envelope";

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
  quality_gates?: AiQualityGate[];
}

export type InsightItem =
  string | { text: string; confidence?: number; severity?: string; impact?: string; category?: string; evidence_score?: number };

export type TrendItem = string | { text: string; confidence?: number };

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

export async function aiInsights(
  question: string,
  results: Record<string, unknown>[],
  language?: string,
  priorContext?: string
): Promise<{ insights: InsightItem[]; trends: TrendItem[]; suggested_next_steps: string[]; filtered_insights_count?: number }> {
  const body: Record<string, unknown> = { question, results };
  if (language) body.language = language;
  if (priorContext) body.prior_context = priorContext;
  return apiFetch("/ai/insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
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

export interface SuggestedQuestion {
  question: string;
  category: "overview" | "comparison" | "trend" | "breakdown" | "anomaly";
  reason: string;
}

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
  insights?: InsightItem[];
  trends?: TrendItem[];
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

export async function exportBundle(
  runs: unknown[],
  name: string
): Promise<{ version: string; name: string; created_at: string; runs: unknown[]; metadata: Record<string, unknown>; status: string }> {
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
