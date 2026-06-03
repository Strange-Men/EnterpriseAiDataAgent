import type { TableInfo } from "@/types";
import { apiFetch } from "@/services/api/http-client";

export interface PaginatedData {
  columns: string[];
  data: Record<string, unknown>[];
  page: number;
  pageSize: number;
  totalRows: number;
  hasMore: boolean;
}

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
  await apiFetch(`/tables/${encodeURIComponent(tableName)}/rename`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ new_name: newName }),
  });
}
