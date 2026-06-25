"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDataStore } from "@/stores/data-store";
import { useAnalysisStore } from "@/stores/analysis-store";
import { useInvestigationStore } from "@/stores/investigation-store";
import { useTables } from "@/hooks/use-tables";
import { useSqlEditorStore } from "@/stores/sql-editor-store";
import { Tooltip } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/ui/empty-state";
import {
  deleteTable as apiDeleteTable,
  renameTable as apiRenameTable,
  fetchTableData,
  fetchQualityReport,
} from "@/services/api";
import { logger } from "@/services/logger";
import toast from "react-hot-toast";
import type { TableInfo } from "@/types";

const SYSTEM_HISTORY_TABLE = "query_history";

export function TableManagementPanel() {
  const { t } = useTranslation();
  const { setCurrentData, setQualityReport } = useDataStore();
  const { tables, reload: loadTables } = useTables();
  const { setCurrentSql } = useSqlEditorStore();
  const setInvestigationContext = useInvestigationStore((s) => s.setContext);
  const activeTable = useInvestigationStore((s) => s.activeTable);
  const analysisRuns = useAnalysisStore((s) => s.runs);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const handleSelect = async (table: TableInfo) => {
    setInvestigationContext({ table: table.name });
    setCurrentSql(`SELECT * FROM "${table.name}" LIMIT 100;`);
    try {
      const { columns, data } = await fetchTableData(table.name);
      setCurrentData(data, columns);
    } catch {
      setCurrentData(null);
    }
    try {
      const report = await fetchQualityReport(table.name);
      setQualityReport(report);
    } catch {
      setQualityReport(null);
    }
  };

  const handleDelete = async (tableName: string) => {
    if (tableName === SYSTEM_HISTORY_TABLE) {
      if (!confirm(t("table.system-table-delete-warning"))) return;
    } else {
      if (!confirm(t("table.confirm-delete"))) return;
    }
    setLoading(true);
    try {
      await apiDeleteTable(tableName);
      toast.success(t("table.delete-success", { name: tableName }));
      logger.info("store", `Deleted table: ${tableName}`);
      await loadTables();
      if (useInvestigationStore.getState().activeTable === tableName) {
        // Auto-select next valid table or null
        const remaining = tables.filter((t) => t.name !== tableName);
        if (remaining.length > 0) {
          setInvestigationContext({ table: remaining[0].name });
        } else {
          setInvestigationContext({ table: null });
          setCurrentData(null);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("table.delete-failed");
      toast.error(msg);
      logger.error("store", `Delete failed: ${tableName}`, err);
    }
    if (mountedRef.current) setLoading(false);
  };

  const handleRename = async (tableName: string) => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      await apiRenameTable(tableName, newName.trim());
      toast.success(`Renamed to "${newName.trim()}"`);
      logger.info("store", `Renamed: ${tableName} → ${newName.trim()}`);
      if (!mountedRef.current) return;
      setRenaming(null);
      setNewName("");
      await loadTables();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Rename failed";
      toast.error(msg);
      logger.error("store", `Rename failed: ${tableName}`, err);
    }
    if (mountedRef.current) setLoading(false);
  };

  const handleExport = (tableName: string) => {
    window.open(`/api/table/${encodeURIComponent(tableName)}/export`, "_blank");
    toast.success(`Exporting "${tableName}"`);
  };

  const startRename = (tableName: string) => {
    setRenaming(tableName);
    setNewName(tableName);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-default)]">
        <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
          {t("table.management")}
        </span>
        <button
          onClick={loadTables}
          className="px-2 py-1 text-xs border border-[var(--border-default)] text-[var(--text-muted)] rounded hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
          title={t("table.refresh")}
        >
          ↻
        </button>
      </div>

      {/* Table list */}
      {tables.length === 0 ? (
        <EmptyState
          icon="📊"
          title={t("table.no-tables")}
          description={t("table.no-tables-desc")}
        />
      ) : (
        <div className="space-y-1">
          {tables.map((tbl: TableInfo) => {
            const isSelected = tbl.name === activeTable;
            const isSystemTable = tbl.name === SYSTEM_HISTORY_TABLE;
            return (
            <div
              key={tbl.name}
              className={`group px-3 py-2 rounded-md transition-colors ${
                isSelected
                  ? "bg-[var(--accent)]/5 border border-[var(--accent)]/30"
                  : "bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--accent)]"
              }`}
            >
              {/* Table name row */}
              <div className="flex items-center justify-between mb-1">
                {renaming === tbl.name ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRename(tbl.name)}
                      className="flex-1 px-2 py-0.5 text-sm bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--accent)] rounded focus:outline-none"
                      autoFocus
                    />
                    <button onClick={() => handleRename(tbl.name)} className="text-xs text-green-400 hover:text-green-300" title={t("table.confirm")}>✓</button>
                    <button onClick={() => setRenaming(null)} className="text-xs text-red-400 hover:text-red-300" title={t("table.cancel")}>✕</button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleSelect(tbl)}
                      className="text-sm text-[var(--text-primary)] hover:text-[var(--accent)] text-left truncate max-w-[160px]"
                      data-tooltip={tbl.name}
                    >
                      <Tooltip text={tbl.name} maxLen={22} />
                    </button>
                    <div className="flex items-center gap-1.5">
                      {isSystemTable && (
                        <span className="text-[10px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-400 font-medium">
                          {t("table.system-history-badge")}
                        </span>
                      )}
                      {isSelected && (
                        <span className="text-[10px] px-1 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)]">
                          {t("table.current-selected-badge")}
                        </span>
                      )}
                      {(() => {
                        const count = analysisRuns.filter((r) => r.table === tbl.name).length;
                        return count > 0 ? (
                          <span className="text-[10px] px-1 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)]" title={t("dataset.analysis-count")}>
                            {count}A
                          </span>
                        ) : null;
                      })()}
                      <span className="text-xs text-[var(--text-muted)] tabular-nums">
                        {tbl.rowCount.toLocaleString()} {t("table.rows-label")} · {tbl.columnCount} {t("table.cols-label")}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* System table description */}
              {isSystemTable && renaming !== tbl.name && (
                <p className="text-[10px] text-amber-400/80 mb-1 leading-relaxed">
                  {t("table.system-history-desc")}
                </p>
              )}

              {/* Action buttons */}
              {renaming !== tbl.name && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setCurrentSql(`SELECT * FROM "${tbl.name}" LIMIT 100;`)}
                    className="px-1.5 py-0.5 text-[10px] border border-[var(--border-default)] text-[var(--text-muted)] rounded hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                    title={t("table.query")}
                  >
                    SQL
                  </button>
                  <button
                    onClick={() => startRename(tbl.name)}
                    disabled={loading}
                    className="px-1.5 py-0.5 text-[10px] border border-[var(--border-default)] text-[var(--text-muted)] rounded hover:text-[var(--info)] hover:border-[var(--info)] transition-colors disabled:opacity-50"
                    title={t("table.rename")}
                  >
                    {t("table.rename-btn")}
                  </button>
                  <button
                    onClick={() => handleExport(tbl.name)}
                    className="px-1.5 py-0.5 text-[10px] border border-[var(--border-default)] text-[var(--text-muted)] rounded hover:text-[var(--success)] hover:border-[var(--success)] transition-colors"
                    title={t("table.export")}
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => handleDelete(tbl.name)}
                    disabled={loading}
                    className={`px-1.5 py-0.5 text-[10px] border rounded transition-colors disabled:opacity-50 ${
                      isSystemTable
                        ? "border-amber-500/30 text-amber-400/60 hover:text-amber-400 hover:border-amber-400 hover:bg-amber-500/10"
                        : "border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--error)] hover:border-[var(--error)]"
                    }`}
                    title={isSystemTable ? t("table.system-table-delete-title") : t("table.delete")}
                    aria-label={isSystemTable ? t("table.system-table-delete-title") : t("table.delete-aria")}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )})}
        </div>
      )}

      {/* Stats */}
      {tables.length > 0 && (
        <div className="text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-default)]">
          {tables.length} {t("table.tables-total")} · {tables.reduce((s, t) => s + t.rowCount, 0).toLocaleString()} {t("table.rows-total")}
        </div>
      )}
    </div>
  );
}
