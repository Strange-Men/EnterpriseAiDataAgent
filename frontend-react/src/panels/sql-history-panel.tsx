"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSqlHistoryStore } from "@/stores/sql-history-store";
import { useSqlWorkspaceStore } from "@/stores/sql-workspace-store";
import { fetchQueryHistory } from "@/services/api";

export function SqlHistoryPanel() {
  const { t } = useTranslation();
  const { history, setHistory } = useSqlHistoryStore();
  const { setCurrentSql } = useSqlWorkspaceStore();

  useEffect(() => {
    fetchQueryHistory()
      .then(setHistory)
      .catch(() => {});
  }, [setHistory]);

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-[var(--text-muted)]">{t("history.empty")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border-default)]">
        <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
          {t("history.title")}
        </span>
        <span className="text-xs text-[var(--text-muted)]">{history.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="group px-3 py-2 rounded-md bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--accent)] transition-colors cursor-pointer"
            onClick={() => setCurrentSql(entry.sql)}
          >
            {/* SQL preview */}
            <p className="text-xs font-mono text-[var(--text-primary)] truncate mb-1">
              {entry.sql.length > 60 ? entry.sql.slice(0, 60) + "..." : entry.sql}
            </p>
            {/* Metadata */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  entry.status === "success" ? "bg-green-400" : "bg-red-400"
                }`}
              />
              <span className="text-[10px] text-[var(--text-muted)] tabular-nums">
                {entry.runtimeMs}ms
              </span>
              {entry.status === "success" && (
                <span className="text-[10px] text-[var(--text-muted)]">
                  {entry.rowCount} {t("sql.rows")}
                </span>
              )}
              <span className="text-[10px] text-[var(--text-muted)] ml-auto">
                {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : ""}
              </span>
            </div>
            {/* Error preview */}
            {entry.status === "error" && entry.error && (
              <p className="text-[10px] text-red-400 mt-1 truncate">{entry.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
