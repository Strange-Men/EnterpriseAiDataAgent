"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAIStatus, fetchStatus } from "@/services/api/status";
import { fetchTables } from "@/services/api/tables";

export const serverStateKeys = {
  status: ["system-status"] as const,
  tables: ["tables"] as const,
  aiStatus: ["ai-status"] as const,
};

export function useSystemStatusQuery() {
  return useQuery({
    queryKey: serverStateKeys.status,
    queryFn: fetchStatus,
    refetchInterval: 10_000,
  });
}

export function useTablesQuery() {
  return useQuery({
    queryKey: serverStateKeys.tables,
    queryFn: fetchTables,
    staleTime: 15_000,
  });
}

export function useAIStatusQuery() {
  return useQuery({
    queryKey: serverStateKeys.aiStatus,
    queryFn: fetchAIStatus,
    refetchInterval: 10_000,
  });
}
