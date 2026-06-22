"use client";

import { useTranslation } from "react-i18next";
import type { AnalysisRun } from "@/stores/analysis-store";
import { formatLocalTime, formatLocalDate } from "@/utils/datetime";
import { renderSafeText } from "@/utils/safe-render";

interface RunTimelineProps {
  runs: AnalysisRun[];
}

export function RunTimeline({ runs }: RunTimelineProps) {
  const { t } = useTranslation();

  if (runs.length === 0) return null;

  const statusColors: Record<string, string> = {
    success: "bg-green-500",
    error: "bg-red-500",
    running: "bg-yellow-500",
  };

  return (
    <div>
      <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-3">
        {t("inv.timeline")} ({runs.length})
      </h3>
      <div className="space-y-0">
        {runs.map((run, i) => {
          const d = new Date(run.timestamp);
          const timeStr = formatLocalTime(d);
          const dateStr = formatLocalDate(d);
          const isLast = i === runs.length - 1;

          return (
            <div key={run.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusColors[run.status] || "bg-[var(--bg-tertiary)]"}`} />
                {!isLast && <div className="w-px flex-1 bg-[var(--border-default)]" />}
              </div>
              <div className={`pb-4 flex-1 min-w-0 ${isLast ? "" : ""}`}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)]">{dateStr} {timeStr}</span>
                  {run.version > 1 && (
                    <span className="text-[10px] px-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                      v{run.version}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-primary)] truncate mt-0.5">
                  {renderSafeText(run.question || run.table || run.mode, "Analysis")}
                </p>
                {run.sections.length > 0 && (
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {run.sections.length} {t("inv.sections")}
                  </p>
                )}
                {run.error && (
                  <p className="text-[10px] text-red-400 mt-0.5 truncate">{renderSafeText(run.error, "")}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
