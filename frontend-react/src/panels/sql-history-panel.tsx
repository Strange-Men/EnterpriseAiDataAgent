"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSqlHistoryStore } from "@/stores/sql-history-store";
import { useSqlWorkspaceStore } from "@/stores/sql-workspace-store";
import { useQueryTabsStore } from "@/stores/query-tabs-store";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchQueryHistory } from "@/services/api";
import { downloadBlob } from "@/utils/download";
import toast from "react-hot-toast";

export function SqlHistoryPanel() {
  const { t } = useTranslation();
  const {
    setHistory, addEntry, removeEntry, clearHistory,
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
    getFiltered,
  } = useSqlHistoryStore();
  const { setExecuting, setQueryResult } = useSqlWorkspaceStore();
  const { addTab, updateTabSql, getActiveTab, setActiveTab } = useQueryTabsStore();

  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    fetchQueryHistory()
      .then(setHistory)
      .catch(() => {});
  }, [setHistory]);

  const filtered = getFiltered();

  // Load SQL into current tab
  const handleLoad = (sql: string) => {
    const tab = getActiveTab();
    if (tab) {
      updateTabSql(tab.id, sql);
    }
  };

  // Re-run SQL in a new tab
  const handleRerun = (sql: string) => {
    const id = addTab(undefined, sql);
    setActiveTab(id);
  };

  // Export history as JSON
  const handleExport = () => {
    const { exportHistory } = useSqlHistoryStore.getState();
    const json = exportHistory();
    downloadBlob("query_history.json", json, "application/json");
    toast.success(t("history.exported"));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-default)]">
        <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
          {t("history.title")}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">{filtered.length}</span>
          {filtered.length > 0 && (
            <>
              <button
                onClick={handleExport}
                className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                title={t("history.export")}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <button
                onClick={() => setShowConfirmClear(true)}
                className="text-[10px] text-[var(--text-muted)] hover:text-red-400 transition-colors"
                title={t("history.clear")}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-2 mb-2">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("history.search")}
          className="flex-1 px-2 py-1 text-xs bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-md focus:border-[var(--accent)] focus:outline-none"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | "success" | "error")}
          className="px-2 py-1 text-xs bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-default)] rounded-md focus:border-[var(--accent)] focus:outline-none"
        >
          <option value="all">{t("history.filter-all")}</option>
          <option value="success">{t("history.filter-success")}</option>
          <option value="error">{t("history.filter-error")}</option>
        </select>
      </div>

      {/* Clear confirmation */}
      {showConfirmClear && (
        <div className="px-3 py-2 mb-2 bg-red-500/10 border border-red-500/30 rounded-md">
          <p className="text-xs text-red-400 mb-2">{t("history.confirm-clear")}</p>
          <div className="flex gap-2">
            <button
              onClick={() => { clearHistory(); setShowConfirmClear(false); }}
              className="px-2 py-1 text-[10px] bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30"
            >
              {t("table.confirm")}
            </button>
            <button
              onClick={() => setShowConfirmClear(false)}
              className="px-2 py-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              {t("table.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* History list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon=" "
          title={searchQuery ? t("history.no-results") : t("history.empty")}
          description={searchQuery ? t("history.try-different") : "Your query history will appear here"}
        />
      ) : (
        <div className="flex-1 overflow-y-auto space-y-1">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="group px-3 py-2 rounded-md bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--accent)] transition-colors"
            >
              {/* SQL preview — clickable to load */}
              <div className="flex items-start gap-2">
                <p
                  className="flex-1 text-xs font-mono text-[var(--text-primary)] cursor-pointer truncate"
                  onClick={() => handleLoad(entry.sql)}
                  title={entry.sql}
                >
                  {entry.sql.length > 60 ? entry.sql.slice(0, 60) + "..." : entry.sql}
                </p>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => handleRerun(entry.sql)}
                    className="p-0.5 text-[var(--text-muted)] hover:text-[var(--accent)]"
                    title={t("history.rerun")}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="p-0.5 text-[var(--text-muted)] hover:text-red-400"
                    title={t("history.delete")}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-2 mt-1">
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
      )}
    </div>
  );
}
