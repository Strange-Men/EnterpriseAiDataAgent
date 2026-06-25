"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useInvestigationStore } from "@/stores/investigation-store";
import { useDataStore } from "@/stores/data-store";
import { useAnalysisStore } from "@/stores/analysis-store";

export function CurrentTableCard() {
  const { t } = useTranslation();
  const activeTable = useInvestigationStore((s) => s.activeTable);
  const tables = useDataStore((s) => s.tables);
  const qualityReports = useDataStore((s) => s.qualityReports);
  const analysisRuns = useAnalysisStore((s) => s.runs);

  const tableInfo = tables.find((tbl) => tbl.name === activeTable);
  const analysisCount = activeTable
    ? analysisRuns.filter((r) => r.table === activeTable).length
    : 0;
  const qualityScore = activeTable
    ? qualityReports[activeTable]?.overallScore ?? null
    : null;

  if (!activeTable || !tableInfo) {
    return (
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] p-4">
        <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
          {t("table.current-card-title")}
        </h3>
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="w-10 h-10 mb-3 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-xl text-[var(--text-muted)]">
            📋
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
            {t("table.current-empty-title")}
          </p>
          <p className="text-xs text-[var(--text-muted)] max-w-[220px]">
            {t("table.current-empty-desc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4">
      <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-3">
        {t("table.current-card-title")}
      </h3>

      {/* Table name */}
      <p
        className="text-sm font-medium text-[var(--text-primary)] truncate mb-2"
        title={tableInfo.name}
      >
        {tableInfo.name}
      </p>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted)] mb-3">
        <span className="tabular-nums">
          {tableInfo.rowCount.toLocaleString()} {t("table.rows-label")}
        </span>
        <span className="text-[var(--border-default)]">·</span>
        <span className="tabular-nums">
          {tableInfo.columnCount} {t("table.cols-label")}
        </span>
        {analysisCount > 0 && (
          <>
            <span className="text-[var(--border-default)]">·</span>
            <span className="px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] text-[10px]">
              {analysisCount}A
            </span>
          </>
        )}
        {qualityScore !== null && (
          <>
            <span className="text-[var(--border-default)]">·</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                qualityScore >= 80
                  ? "bg-green-500/10 text-green-400"
                  : qualityScore >= 60
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-red-500/10 text-red-400"
              }`}
            >
              Q{qualityScore}
            </span>
          </>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-[var(--text-muted)] mb-3">
        {t("table.current-card-desc")}
      </p>

      {/* Start Analysis link */}
      <Link
        href="/analyze"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
      >
        {t("table.start-analysis")} →
      </Link>
    </div>
  );
}
