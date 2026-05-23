"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { exportQueryResult } from "@/services/api";
import toast from "react-hot-toast";

interface ExportDropdownProps {
  sql: string;
  disabled?: boolean;
}

export function ExportDropdown({ sql, disabled }: ExportDropdownProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const doExport = async (format: "csv" | "json" | "excel") => {
    if (!sql.trim()) return;
    setExporting(true);
    setOpen(false);
    try {
      const blob = await exportQueryResult(sql, format);
      const ext = format === "excel" ? "xlsx" : format;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `query_result.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("export.success", { format: format.toUpperCase() }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed";
      toast.error(msg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled || !sql.trim() || exporting}
        className="px-3 py-1.5 text-xs border border-[var(--border-default)] text-[var(--text-muted)] rounded-md hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
      >
        {exporting ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            {t("export.exporting")}
          </>
        ) : (
          <>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t("export.button")}
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md shadow-lg z-50 py-1">
          <button
            onClick={() => doExport("csv")}
            className="w-full px-3 py-1.5 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent)] transition-colors"
          >
            {t("export.csv")}
          </button>
          <button
            onClick={() => doExport("json")}
            className="w-full px-3 py-1.5 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent)] transition-colors"
          >
            {t("export.json")}
          </button>
          <button
            onClick={() => doExport("excel")}
            className="w-full px-3 py-1.5 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent)] transition-colors"
          >
            {t("export.excel")}
          </button>
        </div>
      )}
    </div>
  );
}
