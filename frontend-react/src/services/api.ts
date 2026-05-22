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
  return res.json();
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

export async function fetchTableSchema(
  tableName: string
): Promise<{ name: string; dtype: string; nullable: boolean; uniqueCount: number }[]> {
  return apiFetch(`/tables/${encodeURIComponent(tableName)}/schema`);
}

export async function deleteTable(tableName: string): Promise<void> {
  await apiFetch(`/tables/${encodeURIComponent(tableName)}`, { method: "DELETE" });
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
