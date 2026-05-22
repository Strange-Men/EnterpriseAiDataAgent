"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDataStore } from "@/stores/data-store";
import { StatusBadge } from "@/components/ui/status-badge";
import { fetchStatus } from "@/services/api";

export function StatusPanel() {
  const { t } = useTranslation();
  const { systemStatus, setSystemStatus } = useDataStore();

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
    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [setSystemStatus]);

  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider pb-2 border-b border-[var(--border-default)]">
        {t("status.title")}
      </div>

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
            status={systemStatus.rag}
            label={t("status.unknown")}
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">{t("status.rag")}</p>
        </div>
      </div>

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
    </div>
  );
}
