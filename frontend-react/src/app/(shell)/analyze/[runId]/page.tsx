"use client";

import dynamic from "next/dynamic";
import { use, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Search, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { useAnalysisStore, type AnalysisRun } from "@/stores/analysis-store";
import { Button } from "@/components/ui/button";
import { PanelSkeleton } from "@/components/ui/skeleton";
import { renderSafeText } from "@/utils/safe-render";

const RunHeader = dynamic(
  () => import("@/components/investigation/run-header").then((m) => ({ default: m.RunHeader })),
  { loading: () => <PanelSkeleton /> }
);
const RunTimeline = dynamic(
  () => import("@/components/investigation/run-timeline").then((m) => ({ default: m.RunTimeline })),
  { loading: () => null }
);
const RunSections = dynamic(
  () => import("@/components/investigation/run-sections").then((m) => ({ default: m.RunSections })),
  { loading: () => null }
);
const RunTrace = dynamic(
  () => import("@/components/investigation/run-trace").then((m) => ({ default: m.RunTrace })),
  { loading: () => null }
);
const RunEvaluation = dynamic(
  () => import("@/components/investigation/run-evaluation").then((m) => ({ default: m.RunEvaluation })),
  { loading: () => null }
);
const DrillDownChain = dynamic(
  () => import("@/components/investigation/drill-down-chain").then((m) => ({ default: m.DrillDownChain })),
  { loading: () => null }
);

/**
 * Check if a successful run has incomplete report content.
 */
function isPartialReport(run: AnalysisRun): boolean {
  const hasSummary = typeof run.multiResult?.summary === "string" && run.multiResult.summary.trim().length > 0;
  const hasSections = Array.isArray(run.sections) && run.sections.length > 0;
  const hasSteps = Array.isArray(run.multiResult?.steps) && run.multiResult!.steps!.length > 0;
  // A complete report should have at least summary OR sections OR steps
  return !hasSummary && !hasSections && !hasSteps;
}

/**
 * User-friendly failed run banner with collapsible technical details.
 */
function FailedRunBanner({ error }: { error?: string }) {
  const { t } = useTranslation();
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="border border-red-500/30 rounded-lg p-4 bg-red-500/5">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <p className="text-sm font-medium text-red-400">{t("analysis.failed-title")}</p>
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-2">{t("analysis.failed-desc")}</p>
      {error && (
        <div>
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {showDetail ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            {t("analysis.technical-detail")}
          </button>
          {showDetail && (
            <pre className="mt-2 p-3 text-xs text-red-300 bg-red-500/10 rounded-md overflow-x-auto font-mono whitespace-pre-wrap">
              {renderSafeText(error, "Unknown error")}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnalysisDetailPage({ params }: { params: Promise<{ runId: string }> }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { runId } = use(params);
  const run = useAnalysisStore((s) => s.runs.find((r) => r.id === runId));
  // FIX: subscribe to raw runs and memoize chain computation to avoid React #185
  const runs = useAnalysisStore((s) => s.runs);
  const getEvolutionChain = useAnalysisStore((s) => s.getEvolutionChain);
  const chain = useMemo(() => getEvolutionChain(runId), [runs, runId, getEvolutionChain]);

  if (!run) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24 text-center">
        <Search className="w-10 h-10 text-[var(--text-muted)]/40 mb-3" strokeWidth={1} />
        <p className="text-sm text-[var(--text-primary)] mb-1">
          {t("analysis.not-found")}
        </p>
        <p className="text-xs text-[var(--text-muted)] mb-4 max-w-sm">
          {t("analysis.not-found-desc")}
        </p>
        <p className="text-xs text-[var(--text-muted)]/60 mb-4 font-mono">
          ID: {runId}
        </p>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={() => router.push("/analyze")}>
            {t("analysis.back-to-workspace")}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push("/history")}>
            {t("analysis.view-history")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <RunHeader run={run} />

      {run.status === "error" && (
        <FailedRunBanner error={run.error} />
      )}

      {run.status === "success" && isPartialReport(run) && (
        <div className="border border-yellow-500/30 rounded-lg p-4 bg-yellow-500/5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <p className="text-sm font-medium text-yellow-400">{t("analysis.partial-report")}</p>
          </div>
          <p className="text-xs text-[var(--text-muted)]">{t("analysis.partial-report-desc")}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RunSections run={run} />
        </div>

        <div className="space-y-6">
          <RunEvaluation run={run} />
          <RunTimeline runs={chain} />
          <DrillDownChain currentRunId={runId} />
          <RunTrace run={run} />
        </div>
      </div>
    </div>
  );
}
