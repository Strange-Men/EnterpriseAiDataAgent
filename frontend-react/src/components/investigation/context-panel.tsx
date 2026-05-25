"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDataStore } from "@/stores/data-store";
import { useInvestigationStore } from "@/stores/investigation-store";
import { fetchTableData } from "@/services/api";

interface ContextPanelProps {
  onTableSelect?: (table: string) => void;
}

export function ContextPanel({ onTableSelect }: ContextPanelProps) {
  const { t } = useTranslation();
  const tables = useDataStore((s) => s.tables);
  const activeTable = useInvestigationStore((s) => s.activeTable);

  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [schemaColumns, setSchemaColumns] = useState<{ name: string; dtype: string }[]>([]);
  const [loadingSchema, setLoadingSchema] = useState(false);

  const loadSchema = useCallback(async (tableName: string) => {
    if (expandedTable === tableName) {
      setExpandedTable(null);
      return;
    }
    setExpandedTable(tableName);
    setLoadingSchema(true);
    try {
      const { columns } = await fetchTableData(tableName, 1);
      const tbl = tables.find((t) => t.name === tableName);
      const dtypes = tbl?.columns?.map((c) => ({ name: c.name, dtype: c.dtype })) ?? columns.map((c) => ({ name: c, dtype: "VARCHAR" }));
      setSchemaColumns(dtypes);
    } catch {
      setSchemaColumns([]);
    } finally {
      setLoadingSchema(false);
    }
  }, [expandedTable, tables]);

  const handleSelect = useCallback((tableName: string) => {
    onTableSelect?.(tableName);
  }, [onTableSelect]);

  if (tables.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-[10px] text-[var(--text-muted)]">{t("inv.context.empty")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-[var(--border-default)]">
        <h3 className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          {t("inv.context.title")}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tables.map((tbl) => {
          const isActive = activeTable === tbl.name;
          const isExpanded = expandedTable === tbl.name;

          return (
            <div key={tbl.name} className="border-b border-[var(--border-default)]/50">
              <button
                onClick={() => handleSelect(tbl.name)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[var(--bg-tertiary)] transition-colors ${
                  isActive ? "bg-[var(--accent)]/5" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className={`text-xs truncate ${isActive ? "text-[var(--accent)] font-medium" : "text-[var(--text-primary)]"}`}>
                    {tbl.name}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {tbl.rowCount} {t("sql.rows")} · {tbl.columns?.length ?? 0} {t("sql.columns")}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); loadSchema(tbl.name); }}
                  className="ml-1 p-0.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                >
                  <svg className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </button>

              {isExpanded && (
                <div className="px-3 pb-2">
                  {loadingSchema ? (
                    <div className="flex gap-1 px-1 py-2">
                      <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] animate-pulse" />
                      <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] animate-pulse" style={{ animationDelay: "0.2s" }} />
                      <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] animate-pulse" style={{ animationDelay: "0.4s" }} />
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {schemaColumns.map((col) => (
                        <div key={col.name} className="flex items-center justify-between text-[10px] px-1 py-0.5 rounded hover:bg-[var(--bg-tertiary)]">
                          <span className="text-[var(--text-secondary)] truncate">{col.name}</span>
                          <span className="text-[var(--text-muted)] font-mono ml-2 shrink-0">{col.dtype}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
