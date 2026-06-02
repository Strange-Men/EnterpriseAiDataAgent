"use client";

import dynamic from "next/dynamic";
import { use } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { MonitorPlay } from "lucide-react";
import { useAnalysisStore } from "@/stores/analysis-store";
import { Button } from "@/components/ui/button";
import { PanelSkeleton } from "@/components/ui/skeleton";
import { FeatureTooltip } from "@/components/onboarding/feature-tooltip";

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

export default function AnalysisDetailPage({ params }: { params: Promise<{ runId: string }> }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { runId } = use(params);
  const run = useAnalysisStore((s) => s.runs.find((r) => r.id === runId));
  const getEvolutionChain = useAnalysisStore((s) => s.getEvolutionChain);

  if (!run) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24 text-center">
        <MonitorPlay className="w-10 h-10 text-[var(--text-muted)]/40 mb-3" strokeWidth={1} />
        <p className="text-sm text-[var(--text-muted)]">{t("analysis.no-selection")}</p>
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => router.push("/analyze")}>
          ← {t("inv.back")}
        </Button>
      </div>
    );
  }

  const chain = getEvolutionChain(runId);

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <RunHeader run={run} />

      {run.error && (
        <div className="border border-red-500/30 rounded-lg p-4 bg-red-500/5">
          <p className="text-xs text-red-400">{run.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FeatureTooltip stepId="view-analysis" position="top">
            <div data-onboarding="analysis-result">
              <RunSections run={run} />
            </div>
          </FeatureTooltip>
          <RunTrace run={run} />
        </div>

        <div className="space-y-6">
          <RunEvaluation run={run} />
          <RunTimeline runs={chain} />
          <DrillDownChain currentRunId={runId} />
        </div>
      </div>
    </div>
  );
}
