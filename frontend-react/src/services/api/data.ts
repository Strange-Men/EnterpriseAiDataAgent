import type { QualityReport } from "@/types";
import { apiFetch } from "@/services/api/http-client";

export type UploadTaskStatus = "pending" | "running" | "success" | "failed";
export type UploadTaskStage = "uploading" | "parsing" | "loading" | "profiling" | "done" | "failed";

export interface UploadTaskResponse {
  task_id: string;
  status: UploadTaskStatus;
  progress: number;
  stage: UploadTaskStage;
  table_name?: string | null;
  error_message?: string | null;
}

export interface SessionTableState {
  app_default_table: string;
  current_table: string;
  user_active_table: string;
}

export async function startUploadTask(file: File): Promise<UploadTaskResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<UploadTaskResponse>("/upload", { method: "POST", body: formData });
}

export async function fetchUploadTaskStatus(taskId: string): Promise<UploadTaskResponse> {
  return apiFetch<UploadTaskResponse>(`/tasks/${encodeURIComponent(taskId)}/status`);
}

export async function fetchSessionTableState(): Promise<SessionTableState> {
  return apiFetch<SessionTableState>("/session/current");
}

export async function clearSessionState(): Promise<SessionTableState & { ok: boolean }> {
  return apiFetch<SessionTableState & { ok: boolean }>("/session/clear", { method: "POST" });
}

export async function waitForUploadTask(
  taskId: string,
  options: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<UploadTaskResponse> {
  const intervalMs = options.intervalMs ?? 2_000;
  const timeoutMs = options.timeoutMs ?? 310_000;
  const started = Date.now();
  while (Date.now() - started <= timeoutMs) {
    const status = await fetchUploadTaskStatus(taskId);
    if (status.status === "success" || status.status === "failed") return status;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error("Upload task polling timed out");
}

export async function uploadFile(
  file: File
): Promise<{ tableName: string; rowCount: number; columnCount: number }> {
  const task = await startUploadTask(file);
  const completed = await waitForUploadTask(task.task_id);
  if (completed.status !== "success" || !completed.table_name) {
    throw new Error(completed.error_message || "Upload failed");
  }
  return { tableName: completed.table_name, rowCount: 0, columnCount: 0 };
}

export async function fetchQualityReport(
  tableName: string
): Promise<QualityReport> {
  return apiFetch<QualityReport>(`/quality/${encodeURIComponent(tableName)}`);
}
