"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight } from "lucide-react";
import { TraceTimeline } from "@/components/ai/trace-timeline";
import type { AnalysisRun } from "@/stores/analysis-store";

interface RunTraceProps {
  run: AnalysisRun;
}

export function RunTrace({ run }: RunTraceProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(true);

  if (!run.trace) {
    return null;
  }

  return (
    <div className="border border-[var(--border-default)] rounded-lg overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-[var(--bg-secondary)] transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
        )}
        <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
          {t("inv.technical-trace")}
        </span>
        <span className="text-xs text-[var(--text-muted)] ml-auto">
          {t("inv.technical-trace-expand")}
        </span>
      </button>
      {!collapsed && (
        <div className="px-4 pb-4">
          <p className="text-xs text-[var(--text-muted)] mb-3">
            {t("inv.technical-trace-desc")}
          </p>
          <TraceTimeline trace={run.trace} />
        </div>
      )}
    </div>
  );
}
