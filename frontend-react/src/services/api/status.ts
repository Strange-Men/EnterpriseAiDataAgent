import { apiFetch } from "@/services/api/http-client";

export interface SystemStatusResponse {
  api: string;
  db: string;
  version: string;
  uptime: string;
}

export interface AIStatus {
  configured: boolean;
  connection: "ok" | "error" | "not_configured";
  model: string;
  temperature: number;
  base_url: string;
}

export async function fetchStatus(): Promise<SystemStatusResponse> {
  return apiFetch<SystemStatusResponse>("/status");
}

export async function fetchAIStatus(): Promise<AIStatus> {
  return apiFetch<AIStatus>("/ai/status");
}
