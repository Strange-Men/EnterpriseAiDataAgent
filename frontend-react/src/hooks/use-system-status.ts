"use client";

import { useEffect } from "react";
import { useDataStore } from "@/stores/data-store";
import { useAIStatusQuery, useSystemStatusQuery, useTablesQuery } from "@/hooks/use-server-state";

/**
 * Hook that syncs cached server state into the legacy Zustand store.
 * Call once in AppShell so every page has fresh data.
 */
export function useSystemStatus() {
  const setSystemStatus = useDataStore((s) => s.setSystemStatus);
  const setTables = useDataStore((s) => s.setTables);
  const setDbStatus = useDataStore((s) => s.setDbStatus);
  const statusQuery = useSystemStatusQuery();
  const tablesQuery = useTablesQuery();

  useEffect(() => {
    if (!statusQuery.data) return;
    const status = statusQuery.data;
    setSystemStatus({
      api: status.api as "ok" | "error" | "unknown",
      db: status.db as "ok" | "error" | "unknown",
      version: status.version,
      uptime: status.uptime,
    });
    setDbStatus(status.db === "ok" ? "connected" : status.db === "error" ? "error" : "idle");
  }, [statusQuery.data, setSystemStatus, setDbStatus]);

  useEffect(() => {
    if (statusQuery.isError) setSystemStatus({ api: "error" });
  }, [statusQuery.isError, setSystemStatus]);

  useEffect(() => {
    if (tablesQuery.data) setTables(tablesQuery.data);
  }, [tablesQuery.data, setTables]);
}

/**
 * Hook for AI status polling (used by StatusPanel).
 */
export function useAIStatus() {
  const query = useAIStatusQuery();
  return {
    aiStatus: query.data ?? null,
    aiError: query.error instanceof Error ? query.error.message : null,
  };
}
