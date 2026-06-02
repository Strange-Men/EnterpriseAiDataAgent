"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSqlEditorStore } from "@/stores/sql-editor-store";
import { useSqlHistoryStore } from "@/stores/sql-history-store";
import { useSavedQueriesStore, type SavedQuery } from "@/stores/saved-queries-store";
import { useInvestigationStore } from "@/stores/investigation-store";
import { MonacoSqlEditor } from "@/components/monaco-sql-editor";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { QueryExplain } from "@/components/query-explain";
import { ExportDropdown } from "@/components/export-dropdown";
import { executeQuery, explainQuery, cancelQuery, aiQuery } from "@/services/api";
import type { ExplainResult } from "@/services/api";
import { AIAnalysisPanel } from "@/panels/ai-analysis-panel";
import type { AnalysisMode } from "@/panels/ai-analysis-panel";
import { logger } from "@/services/logger";
import toast from "react-hot-toast";
import { format } from "sql-formatter";

export function SqlWorkspacePanel() {
  const { t, i18n } = useTranslation();
  const {
    isExecuting, setExecuting,
    queryResult, setQueryResult,
    currentSql,
    hasMore, isLoadingMore, loadMore,
    tabs, activeTabId, addTab, removeTab, renameTab,
    setActiveTab, updateTabSql, getActiveTab,
  } = useSqlEditorStore();
  const { addEntry, fetchHistory } = useSqlHistoryStore();
  const { queries: savedQueries, saveQuery, deleteQuery, toggleFavorite } = useSavedQueriesStore();
  const { stage: wfStage, activeTable: wfTable, advance: wfAdvance, reset: wfReset } = useInvestigationStore();

  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const activeTab = getActiveTab();

  // Cleanup: abort any in-flight query on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // Fetch query history from backend on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Query state — use ref (not useState) so handleCancel always reads current value
  const queryIdRef = useRef<number | null>(null);

  // Explain state
  const [explainResult, setExplainResult] = useState<ExplainResult | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [showExplain, setShowExplain] = useState(false);

  // Save query dialog
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState("");

  // Saved queries panel
  const [showSavedPanel, setShowSavedPanel] = useState(false);

  // Tab rename
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // AI Analysis state
  const [aiMode, setAiMode] = useState<AnalysisMode | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Workflow: AI SQL generation state
  const [generatingSql, setGeneratingSql] = useState(false);

  const handleAiAction = useCallback((mode: AnalysisMode) => {
    setAiMode(mode);
    setShowAiPanel(true);
  }, []);

  const handleGenerateAiSql = useCallback(async () => {
    if (!wfTable || generatingSql) return;
    setGeneratingSql(true);
    try {
      const res = await aiQuery(`Show all data from ${wfTable}`, false, false, undefined, i18n.language);
      if (res.sql && activeTab) {
        updateTabSql(activeTab.id, res.sql);
        wfAdvance("sql-ready", { table: wfTable, sql: res.sql });
        toast.success(t("ai.ready"));
      } else {
        toast.error(res.error || "AI could not generate SQL");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI SQL generation failed");
    } finally {
      if (mountedRef.current) setGeneratingSql(false);
    }
  }, [wfTable, generatingSql, activeTab, updateTabSql, wfAdvance, t, i18n.language]);

  const handleExecute = useCallback(async () => {
    const sql = currentSql.trim();
    if (!sql || useSqlEditorStore.getState().isExecuting) return;

    setExecuting(true);
    setQueryResult(null);
    setShowExplain(false);
    setExplainResult(null);
    setShowAiPanel(false);
    setAiMode(null);
    queryIdRef.current = null;
    startTimeRef.current = Date.now();

    if (wfStage === "sql-ready") {
      wfAdvance("executing");
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await executeQuery(sql, 0, 10000, controller.signal);
      queryIdRef.current = result.queryId;
      setQueryResult(result);
      addEntry({
        id: Date.now(),
        sql,
        status: result.status,
        runtimeMs: result.runtimeMs,
        rowCount: result.rowCount,
        error: result.error,
        timestamp: new Date().toISOString(),
      });
      logger.query(sql, result.rowCount, result.runtimeMs);
      if (result.status === "error") {
        toast.error(`Query failed: ${result.error}`);
      } else {
        toast.success(`OK (${result.rowCount} rows, ${result.runtimeMs}ms)`);
        if (wfStage === "executing" || wfStage === "sql-ready") {
          wfAdvance("done");
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") {
        toast(t("query.cancelled"), { icon: " " });
        return;
      }
      const msg = err instanceof Error ? err.message : "Query failed";
      const ms = Date.now() - startTimeRef.current;
      setQueryResult({
        queryId: 0,
        sql,
        columns: [],
        data: [],
        rowCount: 0,
        runtimeMs: ms,
        status: "error",
        error: msg,
      });
      addEntry({
        id: Date.now(),
        sql,
        status: "error",
        runtimeMs: ms,
        rowCount: 0,
        error: msg,
        timestamp: new Date().toISOString(),
      });
      toast.error(`Query failed: ${msg}`);
    } finally {
      setExecuting(false);
      abortControllerRef.current = null;
    }
  }, [currentSql, setExecuting, setQueryResult, addEntry, wfStage, wfAdvance, t]);

  // EXPLAIN handler
  const handleExplain = useCallback(async () => {
    const sql = currentSql.trim();
    if (!sql) return;

    setShowExplain(true);
    setExplainLoading(true);
    setExplainError(null);
    setExplainResult(null);

    try {
      const result = await explainQuery(sql);
      if (!mountedRef.current) return;
      if (result.status === "error") {
        setExplainError(result.error || "Explain failed");
      } else {
        setExplainResult(result);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setExplainError(err instanceof Error ? err.message : "Explain failed");
    } finally {
      if (mountedRef.current) setExplainLoading(false);
    }
  }, [currentSql]);

  // Cancel handler
  const handleCancel = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (queryIdRef.current) {
      try {
        await cancelQuery(queryIdRef.current);
      } catch { /* ignore */ }
    }
  }, []);

  // SQL Format handler
  const handleFormat = useCallback(() => {
    if (!currentSql.trim()) return;
    try {
      const formatted = format(currentSql, { language: "sql", tabWidth: 2, keywordCase: "upper" });
      if (activeTab) {
        updateTabSql(activeTab.id, formatted);
      }
      toast.success(t("format.success"));
    } catch {
      toast.error(t("format.error"));
    }
  }, [currentSql, activeTab, updateTabSql, t]);

  // Save query
  const handleSaveQuery = useCallback(() => {
    if (!saveName.trim() || !currentSql.trim()) return;
    saveQuery(saveName.trim(), currentSql);
    setShowSaveDialog(false);
    setSaveName("");
    toast.success(t("saved.save-success"));
  }, [saveName, currentSql, saveQuery, t]);

  // Load saved query into tab
  const handleLoadSaved = useCallback((q: SavedQuery) => {
    const tab = useSqlEditorStore.getState().getActiveTab();
    if (tab) {
      updateTabSql(tab.id, q.sql);
    }
    setShowSavedPanel(false);
  }, [updateTabSql]);

  // Keyboard shortcuts — use refs to avoid re-registering on every keystroke
  const currentSqlRef = useRef(currentSql);
  const activeTabRef = useRef(activeTab);
  useEffect(() => { currentSqlRef.current = currentSql; }, [currentSql]);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "S") {
        e.preventDefault();
        if (currentSqlRef.current.trim()) setShowSaveDialog(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "K") {
        e.preventDefault();
        const tab = activeTabRef.current;
        if (tab) updateTabSql(tab.id, "");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [updateTabSql]);

  // Tab rename handler
  const handleTabRename = useCallback((tabId: string) => {
    if (renameValue.trim()) {
      renameTab(tabId, renameValue.trim());
    }
    setRenamingTabId(null);
    setRenameValue("");
  }, [renameValue, renameTab]);

  return (
    <div className="flex flex-col h-full">
      {/* ── Tabs Bar ──────────────────────────────────────── */}
      <div className="flex items-center gap-1 pb-2 mb-2 border-b border-[var(--border-default)] overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`group flex items-center gap-1 px-2.5 py-1 rounded-md text-xs cursor-pointer transition-colors flex-shrink-0 ${
              tab.id === activeTabId
                ? "bg-[var(--accent)] text-[var(--bg-primary)] font-medium"
                : "bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {renamingTabId === tab.id ? (
              <input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => handleTabRename(tab.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTabRename(tab.id);
                  if (e.key === "Escape") { setRenamingTabId(null); }
                }}
                className="w-20 px-1 py-0 text-xs bg-[var(--bg-primary)] border border-[var(--accent)] rounded outline-none"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setRenamingTabId(tab.id);
                  setRenameValue(tab.name);
                }}
                className="truncate max-w-[100px]"
              >
                {tab.name}
              </span>
            )}
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTab(tab.id);
                }}
                className={`ml-1 rounded-full p-0.5 transition-colors ${
                  tab.id === activeTabId
                    ? "hover:bg-[var(--bg-primary)]/20 text-[var(--bg-primary)]"
                    : "hover:bg-[var(--bg-primary)] text-[var(--text-muted)]"
                }`}
              >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => addTab()}
          className="px-2 py-1 rounded-md text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-tertiary)] transition-colors flex-shrink-0"
          title={t("tabs.add")}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* ── Toolbar ──────────────────────────────────────── */}
      <div className="flex items-center flex-wrap gap-2 mb-2">
        <button
          onClick={handleExecute}
          disabled={isExecuting || !currentSql.trim()}
          className="px-4 py-1.5 text-sm bg-[var(--accent)] text-[var(--bg-primary)] rounded-md hover:bg-[var(--accent-hover)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {isExecuting ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-[var(--bg-primary)] border-t-transparent rounded-full animate-spin" />
              {t("sql.running")}
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              {t("sql.execute")}
            </>
          )}
        </button>

        {isExecuting && (
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-xs border border-red-500/50 text-red-400 rounded-md hover:bg-red-500/10 transition-colors"
          >
            {t("query.cancel")}
          </button>
        )}

        <button
          onClick={handleExplain}
          disabled={!currentSql.trim()}
          className="px-3 py-1.5 text-xs border border-[var(--border-default)] text-[var(--text-muted)] rounded-md hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={t("explain.hint")}
        >
          {t("explain.button")}
        </button>

        {/* AI buttons — visible when query has results */}
        {queryResult?.status === "success" && queryResult.data.length > 0 && (
          <>
            <button
              onClick={() => handleAiAction("explain")}
              className="px-3 py-1.5 text-xs border border-purple-500/30 text-purple-400 rounded-md hover:bg-purple-500/10 hover:border-purple-500/50 transition-colors"
              title={t("sql.ai-explain")}
            >
              {t("ai.explain-btn")}
            </button>
            <button
              onClick={() => handleAiAction("insights")}
              className="px-3 py-1.5 text-xs border border-purple-500/30 text-purple-400 rounded-md hover:bg-purple-500/10 hover:border-purple-500/50 transition-colors"
              title={t("sql.ai-insights")}
            >
              {t("ai.insights-btn")}
            </button>
            <button
              onClick={() => handleAiAction("charts")}
              className="px-3 py-1.5 text-xs border border-purple-500/30 text-purple-400 rounded-md hover:bg-purple-500/10 hover:border-purple-500/50 transition-colors"
              title={t("ai.charts-title")}
            >
              {t("ai.charts-title")}
            </button>
            <button
              onClick={() => handleAiAction("anomalies")}
              className="px-3 py-1.5 text-xs border border-amber-500/30 text-amber-400 rounded-md hover:bg-amber-500/10 hover:border-amber-500/50 transition-colors"
              title={t("ai.anomaly-detection")}
            >
              {t("ai.anomaly-detection")}
            </button>
          </>
        )}

        <button
          onClick={handleFormat}
          disabled={!currentSql.trim()}
          className="px-3 py-1.5 text-xs border border-[var(--border-default)] text-[var(--text-muted)] rounded-md hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={t("format.hint")}
        >
          {t("format.button")}
        </button>

        <div className="flex-1" />

        <button
          onClick={() => setShowSavedPanel(!showSavedPanel)}
          className={`px-3 py-1.5 text-xs border rounded-md transition-colors ${
            showSavedPanel
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]"
          }`}
        >
          {t("saved.button")} ({savedQueries.length})
        </button>

        <button
          onClick={() => setShowSaveDialog(true)}
          disabled={!currentSql.trim()}
          className="px-3 py-1.5 text-xs border border-[var(--border-default)] text-[var(--text-muted)] rounded-md hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Ctrl+Shift+S"
        >
          Save
        </button>

        <button
          onClick={() => updateTabSql(activeTabId, "")}
          className="px-3 py-1.5 text-xs border border-[var(--border-default)] text-[var(--text-muted)] rounded-md hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
          title="Ctrl+Shift+K"
        >
          Clear
        </button>

        <ExportDropdown sql={currentSql} disabled={isExecuting} />
      </div>

      {/* ── Workflow Banner ─────────────────────────────────── */}
      {wfStage !== "idle" && wfStage !== "done" && (
        <div className="flex items-center gap-2 px-3 py-1.5 mb-2 bg-purple-500/5 border border-purple-500/20 rounded-md text-xs">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-purple-400 font-medium">
            {wfStage === "uploading" ? "Uploading..." :
             wfStage === "profiling" ? `Table ready: ${wfTable}` :
             wfStage === "analyzing" ? `Analyzing ${wfTable}...` :
             wfStage === "sql-ready" ? `Analysis complete: ${wfTable}` :
             wfStage === "executing" ? "Executing..." : ""}
          </span>
          {wfStage === "sql-ready" && wfTable && (
            <button
              onClick={handleGenerateAiSql}
              disabled={generatingSql}
              className="ml-auto px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded hover:bg-purple-500/20 transition-colors disabled:opacity-50"
            >
              {generatingSql ? "Generating..." : "Generate SQL"}
            </button>
          )}
          <button
            onClick={wfReset}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] ml-1"
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}
      {wfStage === "done" && (
        <div className="flex items-center gap-2 px-3 py-1.5 mb-2 bg-green-500/5 border border-green-500/20 rounded-md text-xs">
          <span className="text-green-400">Done: {wfTable}</span>
          <button
            onClick={wfReset}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] ml-auto"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Save Query Dialog ────────────────────────────── */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) setShowSaveDialog(false); }}>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg p-4 w-80 shadow-xl">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">{t("saved.save-title")}</h3>
            <input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder={t("saved.name-placeholder")}
              className="w-full px-3 py-2 text-sm bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-md focus:border-[var(--accent)] focus:outline-none mb-3"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveQuery();
                if (e.key === "Escape") setShowSaveDialog(false);
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                {t("table.cancel")}
              </button>
              <button
                onClick={handleSaveQuery}
                disabled={!saveName.trim()}
                className="px-3 py-1.5 text-xs bg-[var(--accent)] text-[var(--bg-primary)] rounded-md font-medium disabled:opacity-50"
              >
                {t("saved.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Saved Queries Panel ──────────────────────────── */}
      {showSavedPanel && savedQueries.length > 0 && (
        <div className="mb-2 border border-[var(--border-default)] rounded-md overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-tertiary)]">
            <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
              {t("saved.title")}
            </span>
            <button
              onClick={() => setShowSavedPanel(false)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              {t("table.cancel")}
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto p-2 space-y-1">
            {savedQueries.map((q) => (
              <div
                key={q.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--bg-tertiary)] cursor-pointer group"
              >
                <button
                  onClick={() => toggleFavorite(q.id)}
                  className={`text-xs ${q.favorite ? "text-yellow-400" : "text-[var(--text-muted)]"}`}
                >
                  {q.favorite ? "★" : "☆"}
                </button>
                <span
                  onClick={() => handleLoadSaved(q)}
                  className="flex-1 text-xs text-[var(--text-primary)] truncate"
                >
                  {q.name}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono truncate max-w-[120px]">
                  {q.sql.slice(0, 40)}
                </span>
                <button
                  onClick={() => deleteQuery(q.id)}
                  className="text-xs text-[var(--text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Monaco Editor ────────────────────────────────── */}
      <div className="flex-1 min-h-[200px] mb-2">
        <MonacoSqlEditor
          value={currentSql}
          onChange={(val) => {
            if (activeTab) updateTabSql(activeTab.id, val);
          }}
          onExecute={handleExecute}
          height="100%"
        />
      </div>

      {/* ── Query Statistics ─────────────────────────────── */}
      {queryResult && (
        <div className="flex items-center flex-wrap gap-3 px-3 py-2 mb-2 bg-[var(--bg-tertiary)] rounded-md border border-[var(--border-default)] text-xs">
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${queryResult.status === "success" ? "bg-green-400" : "bg-red-400"}`} />
            <span className="text-[var(--text-muted)]">
              {queryResult.status === "success" ? t("stats.success") : t("stats.error")}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[var(--text-muted)]">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <span className="tabular-nums">{queryResult.rowCount.toLocaleString()}</span>
            <span>{t("stats.rows")}</span>
            {queryResult.truncated && queryResult.totalRows && (
              <span className="text-yellow-500 ml-1">
                (of {queryResult.totalRows.toLocaleString()} total — use EXPORT for full data)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[var(--text-muted)]">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="tabular-nums">{queryResult.runtimeMs}</span>
            <span>{t("stats.ms")}</span>
          </div>
          {queryResult.columns.length > 0 && (
            <div className="flex items-center gap-1 text-[var(--text-muted)]">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
              <span className="tabular-nums">{queryResult.columns.length}</span>
              <span>{t("stats.columns")}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Query Explain ────────────────────────────────── */}
      {showExplain && (
        <div className="mb-2">
          <QueryExplain
            result={explainResult}
            isLoading={explainLoading}
            error={explainError}
          />
        </div>
      )}

      {/* ── Error display ────────────────────────────────── */}
      {queryResult?.status === "error" && (
        <div className="px-3 py-2 mb-2 bg-red-500/10 border border-red-500/30 rounded-md">
          <p className="text-xs font-medium text-red-400 mb-1">{t("sql.error")}</p>
          <p className="text-xs text-red-300 font-mono whitespace-pre-wrap">{queryResult.error}</p>
        </div>
      )}

      {/* ── Result table ─────────────────────────────────── */}
      {queryResult?.status === "success" && queryResult.columns.length > 0 && (
        <div className="flex-1 min-h-0">
          <DataTable
            data={queryResult.data}
            columns={queryResult.columns}
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoading={isLoadingMore}
          />
        </div>
      )}

      {/* ── AI Analysis Panel ─────────────────────────────── */}
      {showAiPanel && aiMode && queryResult?.status === "success" && (
        <div className="mt-2 min-h-[200px] max-h-[400px]">
          <AIAnalysisPanel
            mode={aiMode}
            sql={queryResult.sql}
            question={queryResult.sql}
            results={queryResult.data}
            onClose={() => { setShowAiPanel(false); setAiMode(null); }}
            onSqlGenerated={(newSql) => {
              if (activeTab) {
                updateTabSql(activeTab.id, newSql);
                wfAdvance("sql-ready", { table: wfTable || "", sql: newSql });
              }
            }}
          />
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────── */}
      {!queryResult && !isExecuting && !showExplain && (
        <EmptyState
          icon="⚡"
          title={t("sql.empty")}
          description={t("sql.hint")}
        />
      )}
    </div>
  );
}
