"use client";

import { useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSqlWorkspaceStore } from "@/stores/sql-workspace-store";
import { useSqlHistoryStore } from "@/stores/sql-history-store";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { executeQuery } from "@/services/api";
import { logger } from "@/services/logger";
import toast from "react-hot-toast";

export function SqlWorkspacePanel() {
  const { t } = useTranslation();
  const {
    currentSql, setCurrentSql,
    isExecuting, setExecuting,
    queryResult, setQueryResult,
  } = useSqlWorkspaceStore();
  const { addEntry } = useSqlHistoryStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const handleExecute = useCallback(async () => {
    const sql = currentSql.trim();
    if (!sql || isExecuting) return;

    setExecuting(true);
    setQueryResult(null);
    startTimeRef.current = Date.now();

    try {
      const result = await executeQuery(sql);
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
        logger.query(sql, 0, result.runtimeMs, result.error ?? undefined);
      } else {
        toast.success(`Query OK (${result.rowCount} rows, ${result.runtimeMs}ms)`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Query failed";
      const ms = Date.now() - startTimeRef.current;
      setQueryResult({
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
      logger.query(sql, 0, ms, msg);
    } finally {
      setExecuting(false);
    }
  }, [currentSql, isExecuting, setExecuting, setQueryResult, addEntry]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleExecute();
    }
    // Tab inserts 2 spaces
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newSql = currentSql.substring(0, start) + "  " + currentSql.substring(end);
      setCurrentSql(newSql);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border-default)]">
        <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
          {t("sql.title")}
        </span>
        <div className="flex items-center gap-2">
          {queryResult && (
            <span className="text-xs text-[var(--text-muted)]">
              {t("sql.rows")}: {queryResult.rowCount} · {t("sql.time")}: {queryResult.runtimeMs}ms
            </span>
          )}
        </div>
      </div>

      {/* SQL Editor */}
      <div className="flex flex-col mb-3">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={handleExecute}
            disabled={isExecuting || !currentSql.trim()}
            className="px-4 py-1.5 text-sm bg-[var(--accent)] text-[var(--bg-primary)] rounded-md hover:bg-[var(--accent-hover)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? t("sql.running") : t("sql.execute")}
          </button>
          <button
            onClick={() => setCurrentSql("")}
            className="px-3 py-1.5 text-xs border border-[var(--border-default)] text-[var(--text-muted)] rounded-md hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
          >
            {t("sql.clear")}
          </button>
          <span className="text-xs text-[var(--text-muted)] ml-auto">{t("sql.hint")}</span>
        </div>
        <textarea
          value={currentSql}
          onChange={(e) => setCurrentSql(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("sql.placeholder")}
          spellCheck={false}
          className="w-full h-32 px-3 py-2 text-sm font-mono bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-md focus:border-[var(--accent)] focus:outline-none resize-y"
          style={{ tabSize: 2 }}
        />
      </div>

      {/* Runtime monitor */}
      {isExecuting && (
        <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-[var(--bg-tertiary)] rounded-md border border-[var(--border-default)]">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="text-xs text-[var(--accent)]">{t("sql.executing")}</span>
        </div>
      )}

      {/* Error display */}
      {queryResult?.status === "error" && (
        <div className="px-3 py-2 mb-3 bg-red-500/10 border border-red-500/30 rounded-md">
          <p className="text-xs font-medium text-red-400 mb-1">{t("sql.error")}</p>
          <p className="text-xs text-red-300 font-mono whitespace-pre-wrap">{queryResult.error}</p>
        </div>
      )}

      {/* Result table */}
      {queryResult?.status === "success" && queryResult.columns.length > 0 && (
        <div className="flex-1 min-h-0">
          <DataTable data={queryResult.data} columns={queryResult.columns} />
        </div>
      )}

      {/* Empty state */}
      {!queryResult && !isExecuting && (
        <EmptyState
          icon="⚡"
          title={t("sql.empty")}
          description="Write a SQL query and press Ctrl+Enter to execute"
        />
      )}
    </div>
  );
}
