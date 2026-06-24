"use client";

import dynamic from "next/dynamic";
import { use, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { MonitorPlay, Search } from "lucide-react";
import { useAnalysisStore } from "@/stores/analysis-store";
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
        <p className="text-sm text-[var(--text-muted)] mb-1">
          {t("analysis.not-found", "未找到这次分析记录，可能是浏览器本地历史已清理。")}
        </p>
        <p className="text-xs text-[var(--text-muted)]/60 mb-4 font-mono">
          ID: {runId}
        </p>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={() => router.push("/analyze")}>
            {t("analysis.back-to-workspace", "返回分析工作台")}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push("/history")}>
            {t("analysis.view-history", "查看历史")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <RunHeader run={run} />

      {run.error && (
        <div className="border border-red-500/30 rounded-lg p-4 bg-red-500/5">
          <p className="text-xs text-red-400">{renderSafeText(run.error, "An error occurred")}</p>
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
