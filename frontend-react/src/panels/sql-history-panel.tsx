"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useSqlHistoryStore } from "@/stores/sql-history-store";
import { useSqlEditorStore } from "@/stores/sql-editor-store";
import { useAnalysisStore } from "@/stores/analysis-store";
import { useInvestigationStore } from "@/stores/investigation-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useDataStore } from "@/stores/data-store";
import { EmptyState } from "@/components/ui/empty-state";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { downloadBlob } from "@/utils/download";
import { runToMarkdown } from "@/utils/export-markdown";
import { formatLocalTime, formatRelativeTime, formatRuntime } from "@/utils/datetime";
import { MoreHorizontal, Play, FileText, ClipboardCopy, Trash2, ArrowDownToLine, AlertTriangle } from "lucide-react";
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
  const setPendingRerunDraft = useWorkspaceStore((s) => s.setPendingRerunDraft);
  const runs = useAnalysisStore((s) => s.runs);
  const tables = useDataStore((s) => s.tables);

  // Check if a table still exists in the database
  const isTableValid = useCallback((tableName: string | undefined): boolean => {
    if (!tableName) return false;
    return tables.some((t) => t.name === tableName);
  }, [tables]);

  // Check if a history record is stale (table no longer exists)
  const isRecordStale = useCallback((entry: { tableName?: string }): boolean => {
    if (!entry.tableName) return false; // No table field = not stale (don't误判)
    if (tables.length === 0) return false; // No table list loaded yet = can't判断
    return !tables.some((t) => t.name === entry.tableName);
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
    // Set the table if it still exists
    if (tableName) {
      if (!isTableValid(tableName)) {
        // Table is gone — still navigate, but warn the user
        setPendingRerunDraft({ question, tableName, source: "history-rerun" });
        router.push("/analyze");
        return;
      }
      setActiveTable(tableName);
    }
    // Set pending draft so Analyze page can consume it
    setPendingRerunDraft({ question, tableName, source: "history-rerun" });
    router.push("/analyze");
  }, [router, setActiveTable, setPendingRerunDraft, isTableValid, t]);

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
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[var(--border-default)]">
        <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full">
          {filtered.length} {t("history.title")}
        </span>
        <div className="flex items-center gap-2">
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
      <div className="mb-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("history.search")}
          className="w-full px-3 py-1.5 text-sm bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-md focus:border-[var(--accent)] focus:outline-none mb-2"
        />
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type filter chips */}
          <div className="flex items-center gap-1">
            {(["all", "ai", "sql"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setFilterType(v)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  filterType === v
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "bg-[var(--bg-primary)] text-[var(--text-muted)] border-[var(--border-default)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                }`}
              >
                {v === "all" ? t("history.filter-all") : v === "ai" ? t("history.type-ai") : t("history.type-sql")}
              </button>
            ))}
          </div>
          <span className="text-[var(--border-default)]">|</span>
          {/* Status filter chips */}
          <div className="flex items-center gap-1">
            {(["all", "success", "error"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setFilterStatus(v)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  filterStatus === v
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "bg-[var(--bg-primary)] text-[var(--text-muted)] border-[var(--border-default)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                }`}
              >
                {v === "all" ? t("history.filter-all") : v === "success" ? t("history.filter-success") : t("history.filter-failed")}
              </button>
            ))}
          </div>
        </div>
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
          action={
            !searchQuery && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/data")}
                  className="px-3 py-1.5 text-xs bg-[var(--accent)] text-white rounded-md hover:opacity-90 transition-opacity"
                >
                  {t("history.no-history-action-upload")}
                </button>
                <button
                  onClick={() => router.push("/analyze")}
                  className="px-3 py-1.5 text-xs bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-md hover:border-[var(--accent)] transition-colors"
                >
                  {t("history.no-history-action-analyze")}
                </button>
              </div>
            )
          }
        />
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          {filtered.map((entry) => {
            const isAi = (entry.type || "sql") === "ai";
            const displayTitle = isAi
              ? (entry.question || t("history.unnamed-analysis"))
              : (entry.sql.split("\n")[0].trim() || t("history.unnamed-sql"));
            const truncatedTitle = displayTitle.length > 100 ? displayTitle.slice(0, 100) + "..." : displayTitle;
            const statusKey = entry.status === "success" ? "history.status-success"
              : entry.status === "partial" ? "history.status-partial" : "history.status-error";

            const stale = isRecordStale(entry);

            return (
              <div
                key={entry.id}
                className="group relative px-4 py-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--accent)] hover:shadow-sm transition-all"
              >
                {/* Header: Type badge + Status badge + Time */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    isAi
                      ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                      : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                  }`}>
                    {isAi ? t("history.type-ai") : t("history.type-sql")}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${
                    entry.status === "success" ? "text-green-400" : entry.status === "partial" ? "text-amber-400" : "text-red-400"
                  }`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                      entry.status === "success" ? "bg-green-400" : entry.status === "partial" ? "bg-amber-400" : "bg-red-400"
                    }`} />
                    {t(statusKey)}
                  </span>
                  {stale && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20">
                      <AlertTriangle className="w-3 h-3" />
                      {t("history.stale-badge")}
                    </span>
                  )}
                  <span className="ml-auto text-xs text-[var(--text-muted)]" title={formatLocalTime(entry.timestamp)}>
                    {formatRelativeTime(entry.timestamp)}
                  </span>
                </div>

                {/* Title: Question or SQL summary */}
                <p
                  className="text-sm font-medium text-[var(--text-primary)] leading-snug mb-1.5"
                  title={entry.question || entry.sql}
                >
                  {truncatedTitle}
                </p>

                {/* Metadata: Table · Rows · Duration */}
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] flex-wrap">
                  {entry.tableName ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-[var(--text-muted)]/70">{t("history.table-label")}:</span>
                      <span className={`font-mono px-1 py-0.5 rounded ${
                        stale
                          ? "text-amber-400 bg-amber-500/10 line-through"
                          : "text-[var(--accent)] bg-[var(--bg-tertiary)]"
                      }`}>
                        {entry.tableName}
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] italic">
                      {t("history.table-not-recorded")}
                    </span>
                  )}
                  {entry.tableName && entry.rowCount !== undefined && entry.status !== "error" && (
                    <span className="text-[var(--border-default)]">·</span>
                  )}
                  {entry.rowCount !== undefined && entry.status !== "error" && (
                    <span>{entry.rowCount} {t("sql.rows")}</span>
                  )}
                  {(entry.rowCount !== undefined && entry.status !== "error" && entry.runtimeMs != null) && (
                    <span className="text-[var(--border-default)]">·</span>
                  )}
                  {entry.runtimeMs != null && (
                    <span>{t("history.duration-label")}: {formatRuntime(entry.runtimeMs)}</span>
                  )}
                </div>

                {/* Stale table warning */}
                {stale && (
                  <p className="text-xs text-amber-400 mt-1.5 leading-relaxed">
                    {t("history.stale-description")}
                  </p>
                )}

                {/* AI Summary (if exists) */}
                {entry.summary && isAi && (
                  <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed line-clamp-2">
                    {entry.summary}
                  </p>
                )}

                {/* Error preview */}
                {entry.status === "error" && entry.error && (
                  <p className="text-xs text-red-400 mt-1.5 truncate">{entry.error}</p>
                )}

                {/* Action buttons — primary action + More menu */}
                <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-[var(--border-default)]/50">
                  {isAi ? (
                    <>
                      <button
                        onClick={() => handleOpenDetail(entry.id)}
                        className="px-3 py-1 text-xs font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded hover:bg-purple-500/20 transition-colors"
                      >
                        {t("history.open-detail")}
                      </button>
                      <DropdownMenu
                        align="right"

                        trigger={
                          <button
                            className="px-1.5 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                            title={t("history.more-actions")}
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        }
                      >
                        <DropdownMenuItem
                          onClick={() => {
                            if (stale) {
                              toast.error(t("history.stale-guard"));
                              return;
                            }
                            handleRerunAnalysis(entry.question || entry.sql, entry.tableName);
                          }}
                          disabled={stale}
                        >
                          <Play className="w-3 h-3" />
                          {t("history.rerun-analysis")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportMarkdown(entry.id)}>
                          <FileText className="w-3 h-3" />
                          {t("history.export-md")}
                        </DropdownMenuItem>
                        {entry.question && (
                          <DropdownMenuItem onClick={() => handleCopy(entry.question!)}>
                            <ClipboardCopy className="w-3 h-3" />
                            {t("history.copy-question")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => removeEntry(entry.id)} danger>
                          <Trash2 className="w-3 h-3" />
                          {t("history.delete")}
                        </DropdownMenuItem>
                      </DropdownMenu>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          if (stale) {
                            toast.error(t("history.stale-guard"));
                            return;
                          }
                          handleLoadToWorkspace(entry.sql, entry.tableName);
                        }}
                        className={`px-3 py-1 text-xs font-medium border rounded transition-colors ${
                          stale
                            ? "text-[var(--text-muted)] bg-[var(--bg-tertiary)] border-[var(--border-default)] opacity-60 cursor-not-allowed"
                            : "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"
                        }`}
                        disabled={stale}
                      >
                        {t("history.load-to-workspace")}
                      </button>
                      <DropdownMenu
                        align="right"

                        trigger={
                          <button
                            className="px-1.5 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                            title={t("history.more-actions")}
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        }
                      >
                        <DropdownMenuItem
                          onClick={() => {
                            if (stale) {
                              toast.error(t("history.stale-guard"));
                              return;
                            }
                            handleReExecute(entry.sql);
                          }}
                          disabled={stale}
                        >
                          <Play className="w-3 h-3" />
                          {t("history.re-execute")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExportCsv(entry.sql, entry.tableName)}
                          title={t("history.export-csv-tooltip")}
                        >
                          <ArrowDownToLine className="w-3 h-3" />
                          {t("history.export-csv")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopy(entry.sql)}>
                          <ClipboardCopy className="w-3 h-3" />
                          {t("history.copy-sql")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => removeEntry(entry.id)} danger>
                          <Trash2 className="w-3 h-3" />
                          {t("history.delete")}
                        </DropdownMenuItem>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
