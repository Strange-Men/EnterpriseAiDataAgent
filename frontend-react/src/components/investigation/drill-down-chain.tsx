"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useAnalysisStore } from "@/stores/analysis-store";
import { cn } from "@/utils/cn";
import { formatLocalDate } from "@/utils/datetime";
import { renderSafeText } from "@/utils/safe-render";

interface DrillDownChainProps {
  currentRunId: string;
}

export function DrillDownChain({ currentRunId }: DrillDownChainProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const setActiveRun = useAnalysisStore((s) => s.setActiveRun);
  // FIX: Do NOT call getEvolutionChain inside a Zustand selector — it returns
  // a new array reference every time, causing infinite re-renders (React #185).
  // Instead, subscribe to the raw `runs` array and compute the chain with useMemo.
  const runs = useAnalysisStore((s) => s.runs);
  const getEvolutionChain = useAnalysisStore((s) => s.getEvolutionChain);
  const chain = useMemo(() => getEvolutionChain(currentRunId), [runs, currentRunId, getEvolutionChain]);
  const [viewMode, setViewMode] = useState<"timeline" | "breadcrumb">("timeline");

  const handleNavigate = useCallback((runId: string) => {
    setActiveRun(runId);
    router.push(`/analyze/${runId}`);
  }, [router, setActiveRun]);

  if (chain.length <= 1) {
    return (
      <div>
        <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
          {t("inv.drill-chain")}
        </h3>
        <div className="text-center py-4 border border-[var(--border-default)] rounded-lg bg-[var(--bg-secondary)]">
          <p className="text-[10px] text-[var(--text-muted)]">{t("inv.no-drill-chain")}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
          {t("inv.drill-chain")} ({chain.length})
        </h3>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setViewMode("timeline")}
            className={cn(
              "px-1.5 py-0.5 text-xs rounded transition-colors",
              viewMode === "timeline" ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            )}
          >
            Timeline
          </button>
          <button
            onClick={() => setViewMode("breadcrumb")}
            className={cn(
              "px-1.5 py-0.5 text-xs rounded transition-colors",
              viewMode === "breadcrumb" ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            )}
          >
            Breadcrumb
          </button>
        </div>
      </div>

      {viewMode === "breadcrumb" ? (
        /* Breadcrumb view */
        <div className="flex flex-wrap items-center gap-1">
          {chain.map((run, i) => {
            const isCurrent = run.id === currentRunId;
            const isLast = i === chain.length - 1;
            return (
              <div key={run.id} className="flex items-center gap-1">
                <button
                  onClick={() => handleNavigate(run.id)}
                  className={cn(
                    "px-2 py-0.5 text-xs rounded-md transition-colors",
                    isCurrent
                      ? "bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                  )}
                >
                  {renderSafeText(run.question?.slice(0, 30) || run.mode, "...")}
                </button>
                {!isLast && (
                  <span className="text-[var(--text-muted)] text-[8px]">/</span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Timeline view */
        <div className="space-y-0">
          {chain.map((run, i) => {
            const isCurrent = run.id === currentRunId;
            const isLast = i === chain.length - 1;
            return (
              <div key={run.id} className="flex gap-2">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    isCurrent ? "bg-[var(--accent)] ring-2 ring-[var(--accent)]/30" : "bg-[var(--bg-tertiary)]"
                  )} />
                  {!isLast && <div className="w-px flex-1 bg-[var(--border-default)]" />}
                </div>
                <div className="pb-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleNavigate(run.id)}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded-md transition-colors",
                      isCurrent
                        ? "bg-[var(--accent)]/10 border border-[var(--accent)]/20"
                        : "hover:bg-[var(--bg-tertiary)] border border-transparent"
                    )}
                  >
                    <p className={cn(
                      "text-xs mt-0.5",
                      isCurrent ? "text-[var(--accent)] font-medium" : "text-[var(--text-primary)]"
                    )}>
                      {renderSafeText(run.question || run.table || run.mode, "Analysis")}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        "text-xs px-1 rounded",
                        run.status === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                      )}>
                        {run.status}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {formatLocalDate(new Date(run.timestamp))}
                      </span>
                    </div>
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
