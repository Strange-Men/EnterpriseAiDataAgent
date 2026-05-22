/**
 * API Service Layer.
 *
 * Currently a placeholder for future FastAPI integration.
 * All methods return mock/empty data. Replace with real HTTP calls
 * when the Python backend exposes a REST API.
 */

import type { TableInfo, QualityReport } from "@/types";

const API_BASE = "/api";

// ── Generic fetch wrapper ──────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ── Database ───────────────────────────────────────────────

export async function fetchTables(): Promise<TableInfo[]> {
  // TODO: return apiFetch<TableInfo[]>("/tables");
  return [];
}

export async function fetchTableData(
  tableName: string,
  limit: number = 100
): Promise<{ columns: string[]; data: Record<string, unknown>[] }> {
  // TODO: return apiFetch(`/tables/${tableName}?limit=${limit}`);
  return { columns: [], data: [] };
}

export async function deleteTable(tableName: string): Promise<void> {
  // TODO: return apiFetch(`/tables/${tableName}`, { method: "DELETE" });
}

// ── File Upload ────────────────────────────────────────────

export async function uploadFile(file: File): Promise<{ tableName: string }> {
  // TODO: const formData = new FormData();
  //       formData.append("file", file);
  //       return apiFetch("/upload", { method: "POST", body: formData });
  return { tableName: file.name.replace(/\.[^.]+$/, "") };
}

// ── Quality ────────────────────────────────────────────────

export async function fetchQualityReport(
  tableName: string
): Promise<QualityReport | null> {
  // TODO: return apiFetch<QualityReport>(`/quality/${tableName}`);
  return null;
}

// ── Chat ───────────────────────────────────────────────────

export async function sendChatMessage(
  message: string
): Promise<{ reply: string }> {
  // TODO: return apiFetch("/chat", { method: "POST", body: JSON.stringify({ message }) });
  return { reply: `Mock reply to: ${message}` };
}
