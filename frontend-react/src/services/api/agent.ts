import { apiFetch } from "@/services/api/http-client";

export type AgentRunMode = "skeleton";

export type AgentProviderRequested =
  | "mock"
  | "deepseek"
  | "doubao"
  | "mimo"
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

export interface AgentRun {
  run_id: string;
  status: string;
  intent?: string | null;
  selected_mode?: string | null;
  provider_requested?: string | null;
  provider_used?: string | null;
  fallback_triggered?: boolean;
  fallback_type?: string | null;
  fallback_reason?: string | null;
  is_simulated?: boolean;
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
