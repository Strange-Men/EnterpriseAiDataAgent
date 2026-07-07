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

export interface CreateAgentRunRequest {
  user_input: string;
  table_name?: string | null;
  provider_requested?: AgentProviderRequested;
  mode?: AgentRunMode;
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

export interface AgentRun {
  run_id: string;
  status: string;
  intent?: string | null;
  answer?: string | null;
  business_report?: AgentBusinessReport | null;
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
    mode: "skeleton",
  };

  if (request.table_name !== undefined) {
    payload.table_name = request.table_name;
  }

  if (request.provider_requested !== undefined) {
    payload.provider_requested = request.provider_requested;
  }

  return apiFetch<CreateAgentRunResponse>("/agent/runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
