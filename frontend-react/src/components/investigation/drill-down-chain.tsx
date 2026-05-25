"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useAnalysisStore } from "@/stores/analysis-store";
import { useInvestigationStore } from "@/stores/investigation-store";

interface DrillDownChainProps {
  currentRunId: string;
}

export function DrillDownChain({ currentRunId }: DrillDownChainProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const runs = useAnalysisStore((s) => s.runs);
  const setActiveRun = useAnalysisStore((s) => s.setActiveRun);

  // Build chain: walk parentRunId up, then gather children
  const chain = useAnalysisStore((s) => s.getEvolutionChain(currentRunId));

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

  const handleNavigate = useCallback((runId: string) => {
    setActiveRun(runId);
    router.push(`/analyze/${runId}`);
  }, [router, setActiveRun]);

  return (
    <div>
      <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-3">
        {t("inv.drill-chain")} ({chain.length})
      </h3>
      <div className="space-y-0">
        {chain.map((run, i) => {
          const isCurrent = run.id === currentRunId;
          const isLast = i === chain.length - 1;

          return (
            <div key={run.id} className="flex gap-2">
              <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  isCurrent ? "bg-[var(--accent)] ring-2 ring-[var(--accent)]/30" : "bg-[var(--bg-tertiary)]"
                }`} />
                {!isLast && <div className="w-px flex-1 bg-[var(--border-default)]" />}
              </div>
              <div className="pb-3 flex-1 min-w-0">
                <button
                  onClick={() => handleNavigate(run.id)}
                  className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
                    isCurrent
                      ? "bg-[var(--accent)]/10 border border-[var(--accent)]/20"
                      : "hover:bg-[var(--bg-tertiary)] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {run.drillDownFrom && (
                      <span className="text-[9px] text-[var(--text-muted)]" title={run.drillDownFrom.findingText}>
                        {t("inv.drill-from")}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${isCurrent ? "text-[var(--accent)] font-medium" : "text-[var(--text-primary)]"}`}>
                    {run.question || run.table || run.mode}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] px-1 rounded ${
                      run.status === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {run.status}
                    </span>
                    <span className="text-[9px] text-[var(--text-muted)]">
                      {new Date(run.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
