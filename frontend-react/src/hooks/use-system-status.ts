"use client";

import { useEffect, useState } from "react";
import { useDataStore } from "@/stores/data-store";
import { fetchStatus, fetchTables, fetchAIStatus, type AIStatus } from "@/services/api";

/**
 * Hook that initializes system status + tables on mount and polls every 10s.
 * Call once in AppShell so every page has fresh data.
 */
export function useSystemStatus() {
  const setSystemStatus = useDataStore((s) => s.setSystemStatus);
  const setTables = useDataStore((s) => s.setTables);
  const setDbStatus = useDataStore((s) => s.setDbStatus);

  useEffect(() => {
    let mounted = true;

    const pollStatus = async () => {
      try {
        const s = await fetchStatus();
        if (!mounted) return;
        setSystemStatus({
          api: s.api as "ok" | "error" | "unknown",
          db: s.db as "ok" | "error" | "unknown",
          version: s.version,
          uptime: s.uptime,
        });
        setDbStatus(s.db === "ok" ? "connected" : s.db === "error" ? "error" : "idle");
      } catch {
        if (mounted) setSystemStatus({ api: "error" });
      }
    };

    const pollTables = async () => {
      try {
        const tables = await fetchTables();
        if (mounted) setTables(tables);
      } catch {
        // non-fatal
      }
    };

    // Initial fetch
    pollStatus();
    pollTables();

    // Poll status every 10s
    const interval = setInterval(pollStatus, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [setSystemStatus, setTables, setDbStatus]);
}

/**
 * Hook for AI status polling (used by StatusPanel).
 */
export function useAIStatus() {
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      try {
        const ai = await fetchAIStatus();
        if (!mounted) return;
        setAiStatus(ai);
        setAiError(null);
      } catch (err) {
        if (mounted) setAiError(err instanceof Error ? err.message : "AI status unavailable");
      }
    };

    poll();
    const interval = setInterval(poll, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { aiStatus, aiError };
}
