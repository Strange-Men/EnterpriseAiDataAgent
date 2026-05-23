"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDataStore } from "@/stores/data-store";
import { StatusBadge } from "@/components/ui/status-badge";
import { fetchStatus, fetchAIStatus, type AIStatus } from "@/services/api";

export function StatusPanel() {
  const { t } = useTranslation();
  const { systemStatus, setSystemStatus } = useDataStore();
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const s = await fetchStatus();
        setSystemStatus({
          api: s.api as "ok" | "error" | "unknown",
          db: s.db as "ok" | "error" | "unknown",
          version: s.version,
          uptime: s.uptime,
        });
      } catch {
        setSystemStatus({ api: "error" });
      }
    };

    const pollAI = async () => {
      try {
        const ai = await fetchAIStatus();
        setAiStatus(ai);
        setAiError(null);
      } catch (err) {
        setAiError(err instanceof Error ? err.message : "AI status unavailable");
      }
    };

    poll();
    pollAI();
    const interval = setInterval(() => { poll(); pollAI(); }, 10000);
    return () => clearInterval(interval);
  }, [setSystemStatus]);

  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider pb-2 border-b border-[var(--border-default)]">
        {t("status.title")}
      </div>

      {/* System status */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <StatusBadge
            status={systemStatus.api}
            label={t(
              systemStatus.api === "ok"
                ? "status.operational"
                : systemStatus.api === "error"
                ? "status.error"
                : "status.unknown"
            )}
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">{t("status.api")}</p>
        </div>
        <div>
          <StatusBadge
            status={systemStatus.db}
            label={t(
              systemStatus.db === "ok"
                ? "status.operational"
                : systemStatus.db === "error"
                ? "status.error"
                : "status.unknown"
            )}
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">{t("status.db")}</p>
        </div>
        <div>
          <StatusBadge
            status={aiStatus?.connection === "ok" ? "ok" : aiStatus?.connection === "error" ? "error" : "unknown"}
            label={
              aiStatus?.connection === "ok"
                ? t("status.operational")
                : aiStatus?.connection === "not_configured"
                ? "Not Set"
                : t("status.error")
            }
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">AI</p>
        </div>
      </div>

      {/* Version & uptime */}
      <div className="flex gap-4 text-sm">
        <div>
          <span className="text-[var(--text-muted)]">{t("status.version")}: </span>
          <span className="text-[var(--accent)]">{systemStatus.version}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)]">{t("status.uptime")}: </span>
          <span>{systemStatus.uptime}</span>
        </div>
      </div>

      {/* AI Settings */}
      <div className="border-t border-[var(--border-default)] pt-3">
        <div className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
          AI Settings
        </div>
        {aiError ? (
          <p className="text-xs text-red-400">{aiError}</p>
        ) : aiStatus ? (
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Model</span>
              <span className="font-mono text-[var(--text-primary)]">{aiStatus.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Temperature</span>
              <span className="font-mono text-[var(--text-primary)]">{aiStatus.temperature}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">API Key</span>
              <span className="font-mono text-[var(--text-primary)]">{aiStatus.api_key_preview}</span>
            </div>
            {aiStatus.base_url !== "default" && (
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Base URL</span>
                <span className="font-mono text-[var(--text-primary)] truncate max-w-[140px]">{aiStatus.base_url}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Status</span>
              <span className={`font-medium ${
                aiStatus.connection === "ok" ? "text-green-400" :
                aiStatus.connection === "not_configured" ? "text-yellow-400" : "text-red-400"
              }`}>
                {aiStatus.connection === "ok" ? "Connected" :
                 aiStatus.connection === "not_configured" ? "API key not set" : "Connection error"}
              </span>
            </div>
          </div>
        ) : (
          <div className="animate-pulse space-y-1.5">
            <div className="h-3 bg-[var(--bg-tertiary)] rounded w-3/4" />
            <div className="h-3 bg-[var(--bg-tertiary)] rounded w-1/2" />
          </div>
        )}
      </div>
    </div>
  );
}
