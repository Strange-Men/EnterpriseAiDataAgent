import type { QueryResult } from "@/services/api";

interface QueryStatsBarProps {
  result: QueryResult;
  t: (key: string) => string;
}

export function QueryStatsBar({ result, t }: QueryStatsBarProps) {
  return (
    <div className="flex items-center flex-wrap gap-3 px-3 py-2 mb-2 bg-[var(--bg-tertiary)] rounded-md border border-[var(--border-default)] text-xs">
      <div className="flex items-center gap-1">
        <span className={`w-2 h-2 rounded-full ${result.status === "success" ? "bg-green-400" : "bg-red-400"}`} />
        <span className="text-[var(--text-muted)]">
          {result.status === "success" ? t("stats.success") : t("stats.error")}
        </span>
      </div>
      <div className="flex items-center gap-1 text-[var(--text-muted)]">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
        <span className="tabular-nums">{result.rowCount.toLocaleString()}</span>
        <span>{t("stats.rows")}</span>
        {result.truncated && result.totalRows && (
          <span className="text-yellow-500 ml-1">
            (of {result.totalRows.toLocaleString()} total - use EXPORT for full data)
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 text-[var(--text-muted)]">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="tabular-nums">{result.runtimeMs}</span>
        <span>{t("stats.ms")}</span>
      </div>
      {result.columns.length > 0 && (
        <div className="flex items-center gap-1 text-[var(--text-muted)]">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
          </svg>
          <span className="tabular-nums">{result.columns.length}</span>
          <span>{t("stats.columns")}</span>
        </div>
      )}
    </div>
  );
}
