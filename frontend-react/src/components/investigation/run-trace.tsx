"use client";

import { useTranslation } from "react-i18next";
import { TraceTimeline } from "@/components/ai/trace-timeline";
import type { AnalysisRun } from "@/stores/analysis-store";

interface RunTraceProps {
  run: AnalysisRun;
}

export function RunTrace({ run }: RunTraceProps) {
  const { t } = useTranslation();

  if (!run.trace) {
    return (
      <div className="text-center py-4">
        <p className="text-[10px] text-[var(--text-muted)]">{t("inv.no-evaluation")}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
        {t("inv.raw-trace")}
      </h3>
      <div className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
        <TraceTimeline trace={run.trace} />
      </div>
    </div>
  );
}
