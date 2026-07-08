import { apiFetch } from "@/services/api/http-client";

export type AgentRunMode = "skeleton";

export type AgentProviderRequested =
  | "mock"
  | "deepseek"
  | "doubao"
  | "mimo"
  | string;

export type AgentProviderStatus =
  | "live_success"
  | "mock"
  | "fallback"
  | "error"
  | string;

export type AgentLocale = "zh-CN" | "en-US" | string;

export interface CreateAgentRunRequest {
  user_input: string;
  table_name?: string | null;
  provider_requested?: AgentProviderRequested;
  locale?: AgentLocale;
  mode?: AgentRunMode;
  metadata?: Record<string, unknown>;
}

export interface AgentStep {
  step_id?: string;
  run_id?: string;
  status?: string;
  [key: string]: unknown;
}

export interface AgentToolCall {
  call_id?: string;
  run_id?: string;
  tool_name?: string;
  status?: string;
  [key: string]: unknown;
}

export type BusinessReportItem = string | number | boolean | Record<string, unknown>;

export interface AgentBusinessReport {
  executive_summary?: string | null;
  key_findings?: BusinessReportItem[] | null;
  evidence_summary?: BusinessReportItem[] | null;
  risk_priorities?: BusinessReportItem[] | null;
  opportunities?: BusinessReportItem[] | null;
  recommendations?: BusinessReportItem[] | null;
  next_questions?: BusinessReportItem[] | null;
  limitations?: BusinessReportItem[] | null;
  [key: string]: unknown;
}

export interface BusinessReportViewModelAction {
  priority?: string | null;
  action?: string | null;
  why?: string | null;
  how?: string | null;
  metrics?: string[] | null;
  deadline?: string | null;
  owner_hint?: string | null;
  [key: string]: unknown;
}

export interface BusinessReportViewModelNotice {
  type?: "mock" | "fallback" | "error" | string;
  title?: string | null;
  message?: string | null;
  [key: string]: unknown;
}

export interface BusinessReportViewModel {
  title?: string | null;
  locale?: AgentLocale | null;
  provider_badge?: Record<string, unknown> | null;
  provider_notice?: BusinessReportViewModelNotice | null;
  is_simulated?: boolean;
  sections?: Array<{ id?: string; title?: string } & Record<string, unknown>> | null;
  overall_assessment?: string | null;
  priority_actions?: BusinessReportViewModelAction[] | null;
  risks_and_opportunities?: string[] | null;
  key_evidence?: string[] | null;
  limitations?: string[] | null;
  next_questions?: string[] | null;
  technical_note?: string | null;
  data_table?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface AgentRun {
  run_id: string;
  status: string;
  intent?: string | null;
  answer?: string | null;
  business_report?: AgentBusinessReport | null;
  business_report_view_model?: BusinessReportViewModel | null;
  locale?: AgentLocale | null;
  sql?: string | null;
  evidence?: unknown;
  result_preview?: unknown;
  warnings?: string[];
  trace?: unknown;
  selected_mode?: string | null;
  requested_provider?: string | null;
  provider_requested?: string | null;
  provider_used?: string | null;
  provider_status?: AgentProviderStatus | null;
  fallback_triggered?: boolean;
  fallback_type?: string | null;
  fallback_reason?: string | null;
  is_simulated?: boolean;
  memory_used?: boolean;
  table_name?: string | null;
  user_goal?: string | null;
  steps?: AgentStep[];
  tool_calls?: AgentToolCall[];
  [key: string]: unknown;
}

export interface CreateAgentRunResponse {
  run: AgentRun;
  runtime_mode?: string;
  routed_intent?: Record<string, unknown> | null;
  warnings?: string[];
  [key: string]: unknown;
}

export async function createAgentRun(
  request: CreateAgentRunRequest
): Promise<CreateAgentRunResponse> {
  const payload: CreateAgentRunRequest = {
    user_input: request.user_input,
    locale: request.locale ?? "zh-CN",
    mode: "skeleton",
  };

  if (request.table_name !== undefined) {
    payload.table_name = request.table_name;
  }

  if (request.provider_requested !== undefined) {
    payload.provider_requested = request.provider_requested;
  }

  if (request.metadata !== undefined) {
    payload.metadata = request.metadata;
  }

  return apiFetch<CreateAgentRunResponse>("/agent/runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    timeoutMs: 140_000,
  });
}
