"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useSqlHistoryStore } from "@/stores/sql-history-store";
import { useSqlEditorStore } from "@/stores/sql-editor-store";
import { useAnalysisStore } from "@/stores/analysis-store";
import { useInvestigationStore } from "@/stores/investigation-store";
import { useDataStore } from "@/stores/data-store";
import { EmptyState } from "@/components/ui/empty-state";
import { downloadBlob } from "@/utils/download";
import { runToMarkdown } from "@/utils/export-markdown";
import { formatLocalTime } from "@/utils/datetime";
import toast from "react-hot-toast";

export function SqlHistoryPanel() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    removeEntry, clearHistory,
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
    filterType, setFilterType,
    getFiltered,
    fetchHistory,
  } = useSqlHistoryStore();
  const { addTab, setActiveTab } = useSqlEditorStore();
  const { setActiveTable } = useInvestigationStore();
  const runs = useAnalysisStore((s) => s.runs);
  const tables = useDataStore((s) => s.tables);

  // Check if a table still exists in the database
  const isTableValid = useCallback((tableName: string | undefined): boolean => {
    if (!tableName) return false;
    return tables.some((t) => t.name === tableName);
  }, [tables]);

  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filtered = getFiltered();

  // Copy text to clipboard with fallback
  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("history.copied"));
    } catch {
      // Fallback for environments without clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        toast.success(t("history.copied"));
      } catch {
        toast.error(t("history.copy-failed"));
      }
      document.body.removeChild(textarea);
    }
  }, [t]);

  // AI Analysis: Open detail page
  const handleOpenDetail = useCallback((runId: string) => {
    router.push(`/analyze/${runId}`);
  }, [router]);

  // AI Analysis: Re-run (navigate to workspace with question prefilled)
  const handleRerunAnalysis = useCallback((question: string, tableName?: string) => {
    // Validate table still exists before setting it
    if (tableName) {
      if (!isTableValid(tableName)) {
        toast.error(t("history.table-not-found", { table: tableName }));
        return;
      }
      setActiveTable(tableName);
    }
    router.push("/analyze");
    // Dispatch event so workspace can pick up the question
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("history:rerun-analysis", {
        detail: { question, table: tableName },
      }));
    }, 100);
  }, [router, setActiveTable, isTableValid, t]);

  // Expert SQL: Load to workspace
  const handleLoadToWorkspace = useCallback((sql: string, tableName?: string) => {
    // Validate and set table if available
    if (tableName) {
      if (!isTableValid(tableName)) {
        toast.error(t("history.table-not-found", { table: tableName }));
        return;
      }
      setActiveTable(tableName);
    }
    // Create a new tab with the SQL
    const tabId = addTab(undefined, sql);
    setActiveTab(tabId);
    router.push("/analyze");
    toast.success(t("ai.sql-filled"));
  }, [addTab, setActiveTab, setActiveTable, router, isTableValid, t]);

  // Expert SQL: Re-execute
  const handleReExecute = useCallback((sql: string) => {
    const tabId = addTab(undefined, sql);
    setActiveTab(tabId);
    router.push("/analyze");
    // Auto-execute after a brief delay for navigation
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("history:auto-execute", { detail: { tabId } }));
    }, 300);
  }, [addTab, setActiveTab, router]);

  // AI Analysis: Export as Markdown
  const handleExportMarkdown = useCallback((runId: string) => {
    const run = runs.find((r) => r.id === runId);
    if (!run) {
      toast.error(t("analysis.not-found"));
      return;
    }
    const md = runToMarkdown(run);
    downloadBlob(`analysis-${runId.slice(0, 8)}.md`, md, "text/markdown");
    toast.success(t("history.export-md"));
  }, [runs, t]);

  // Expert SQL: Export as CSV
  const handleExportCsv = useCallback((sql: string, tableName?: string) => {
    // Export the SQL query metadata as CSV
    const header = "field,value\n";
    const rows = [
      `sql,"${sql.replace(/"/g, '""')}"`,
      tableName ? `table,"${tableName}"` : null,
      `exported_at,"${new Date().toISOString()}"`,
    ].filter(Boolean).join("\n");
    downloadBlob(`query-${sql.slice(0, 20).replace(/[^a-zA-Z0-9]/g, "_")}.csv`, header + rows, "text/csv");
    toast.success(t("history.export-csv"));
  }, [t]);

  // Export history as CSV
  const handleExportAll = () => {
    const entries = getFiltered();
    if (entries.length === 0) return;
    const header = "type,question/sql,table,status,rows,runtime_ms,timestamp\n";
    const rows = entries.map((e) => {
      const type = (e.type || "sql") === "ai" ? "AI" : "SQL";
      const text = (e.question || e.sql).replace(/"/g, '""').replace(/\n/g, " ");
      const table = (e.tableName || "").replace(/"/g, '""');
      return `"${type}","${text}","${table}","${e.status}",${e.rowCount},${e.runtimeMs},"${e.timestamp}"`;
    }).join("\n");
    downloadBlob("query_history.csv", header + rows, "text/csv");
    toast.success(t("history.exported"));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-default)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          {t("history.title")}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full">
            {filtered.length}
          </span>
          {filtered.length > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleExportAll}
                className="px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-tertiary)] rounded transition-colors"
              >
                {t("history.export")}
              </button>
              <button
                onClick={() => setShowConfirmClear(true)}
                className="px-2 py-1 text-xs text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
              >
                {t("history.clear")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-2 mb-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("history.search")}
          className="flex-1 px-3 py-1.5 text-sm bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-md focus:border-[var(--accent)] focus:outline-none"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as "all" | "sql" | "ai")}
          className="px-2 py-1.5 text-xs bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-default)] rounded-md focus:border-[var(--accent)] focus:outline-none"
        >
          <option value="all">{t("history.filter-all")}</option>
          <option value="ai">{t("history.type-ai")}</option>
          <option value="sql">{t("history.type-sql")}</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | "success" | "error")}
          className="px-2 py-1.5 text-xs bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-default)] rounded-md focus:border-[var(--accent)] focus:outline-none"
        >
          <option value="all">{t("history.filter-all")}</option>
          <option value="success">{t("history.filter-success")}</option>
          <option value="error">{t("history.filter-error")}</option>
        </select>
      </div>

      {/* Clear confirmation */}
      {showConfirmClear && (
        <div className="px-3 py-2 mb-3 bg-red-500/10 border border-red-500/30 rounded-md">
          <p className="text-xs text-red-400 mb-2">{t("history.confirm-clear")}</p>
          <div className="flex gap-2">
            <button
              onClick={() => { clearHistory(); setShowConfirmClear(false); }}
              className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30"
            >
              {t("table.confirm")}
            </button>
            <button
              onClick={() => setShowConfirmClear(false)}
              className="px-3 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
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
          title={searchQuery ? t("history.no-results") : t("history.no-history-title")}
          description={searchQuery ? t("history.try-different") : t("history.no-history-desc")}
        />
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2">
          {filtered.map((entry) => {
            const isAi = (entry.type || "sql") === "ai";

            return (
              <div
                key={entry.id}
                className="group px-4 py-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--accent)] hover:shadow-sm transition-all"
              >
                {/* Type badge + content */}
                <div className="flex items-start gap-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0 mt-0.5 ${
                    isAi
                      ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                      : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                  }`}>
                    {isAi ? t("history.type-ai") : t("history.type-sql")}
                  </span>
                  <div className="flex-1 min-w-0">
                    {/* Question or SQL preview */}
                    <p
                      className="text-sm text-[var(--text-primary)] leading-relaxed"
                      title={entry.question || entry.sql}
                    >
                      {entry.question
                        ? (entry.question.length > 100 ? entry.question.slice(0, 100) + "..." : entry.question)
                        : (entry.sql.length > 100 ? entry.sql.slice(0, 100) + "..." : entry.sql)
                      }
                    </p>
                    {/* Summary for AI entries */}
                    {entry.summary && isAi && (
                      <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                        {entry.summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Metadata row */}
                <div className="flex items-center gap-3 mt-2 pl-[52px]">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      entry.status === "success" ? "bg-green-400" : entry.status === "partial" ? "bg-amber-400" : "bg-red-400"
                    }`}
                  />
                  {entry.tableName && (
                    <span className="text-xs text-[var(--accent)] font-mono bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded">
                      {entry.tableName}
                    </span>
                  )}
                  <span className="text-xs text-[var(--text-muted)] tabular-nums">
                    {entry.runtimeMs}ms
                  </span>
                  {entry.status !== "error" && (
                    <span className="text-xs text-[var(--text-muted)]">
                      {entry.rowCount} {t("sql.rows")}
                    </span>
                  )}
                  <span className="text-xs text-[var(--text-muted)] ml-auto">
                    {formatLocalTime(entry.timestamp)}
                  </span>
                </div>

                {/* Error preview */}
                {entry.status === "error" && entry.error && (
                  <p className="text-xs text-red-400 mt-1.5 pl-[52px] truncate">{entry.error}</p>
                )}

                {/* Action buttons — always visible */}
                <div className="flex items-center gap-2 mt-2.5 pl-[52px] flex-wrap">
                  {isAi ? (
                    <>
                      <button
                        onClick={() => handleOpenDetail(entry.id)}
                        className="px-2.5 py-1 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded hover:bg-purple-500/20 transition-colors"
                      >
                        {t("history.open-detail")}
                      </button>
                      <button
                        onClick={() => handleRerunAnalysis(entry.question || entry.sql, entry.tableName)}
                        className="px-2.5 py-1 text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                      >
                        {t("history.rerun-analysis")}
                      </button>
                      <button
                        onClick={() => handleExportMarkdown(entry.id)}
                        className="px-2.5 py-1 text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                      >
                        {t("history.export-md")}
                      </button>
                      {entry.question && (
                        <button
                          onClick={() => handleCopy(entry.question!)}
                          className="px-2.5 py-1 text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                        >
                          {t("history.copy-question")}
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleLoadToWorkspace(entry.sql, entry.tableName)}
                        className="px-2.5 py-1 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded hover:bg-blue-500/20 transition-colors"
                      >
                        {t("history.load-to-workspace")}
                      </button>
                      <button
                        onClick={() => handleReExecute(entry.sql)}
                        className="px-2.5 py-1 text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                      >
                        {t("history.re-execute")}
                      </button>
                      <button
                        onClick={() => handleExportCsv(entry.sql, entry.tableName)}
                        className="px-2.5 py-1 text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                      >
                        {t("history.export-csv")}
                      </button>
                      <button
                        onClick={() => handleCopy(entry.sql)}
                        className="px-2.5 py-1 text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                      >
                        {t("history.copy-sql")}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="ml-auto px-2 py-1 text-xs text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {t("history.delete")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
