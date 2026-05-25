"use client";

import { use } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useAnalysisStore } from "@/stores/analysis-store";
import { RunHeader } from "@/components/investigation/run-header";
import { RunTimeline } from "@/components/investigation/run-timeline";
import { RunSections } from "@/components/investigation/run-sections";
import { RunTrace } from "@/components/investigation/run-trace";
import { RunEvaluation } from "@/components/investigation/run-evaluation";
import { DrillDownChain } from "@/components/investigation/drill-down-chain";

export default function AnalysisDetailPage({ params }: { params: Promise<{ runId: string }> }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { runId } = use(params);
  const run = useAnalysisStore((s) => s.runs.find((r) => r.id === runId));
  const getEvolutionChain = useAnalysisStore((s) => s.getEvolutionChain);

  if (!run) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24 text-center">
        <svg className="w-10 h-10 text-[var(--text-muted)]/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-[var(--text-muted)]">{t("analysis.no-selection")}</p>
        <button
          onClick={() => router.push("/analyze")}
          className="mt-2 px-3 py-1 text-xs text-[var(--accent)] hover:underline"
        >
          {t("inv.back")}
        </button>
      </div>
    );
  }

  const chain = getEvolutionChain(runId);

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <RunHeader run={run} />

      {/* Error banner */}
      {run.error && (
        <div className="border border-red-500/30 rounded-lg p-4 bg-red-500/5">
          <p className="text-xs text-red-400">{run.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content: sections */}
        <div className="lg:col-span-2 space-y-6">
          <RunSections run={run} />
          <RunTrace run={run} />
        </div>

        {/* Sidebar: timeline, evaluation, drill-down */}
        <div className="space-y-6">
          <RunEvaluation run={run} />
          <RunTimeline runs={chain} />
          <DrillDownChain currentRunId={runId} />
        </div>
      </div>
    </div>
  );
}
