"use client";

import { useTranslation } from "react-i18next";
import { MonitorPlay } from "lucide-react";
import { AnalysisSectionView } from "@/components/ai/analysis-section";
import { StepResults } from "@/components/ai/step-results";
import { AiChart } from "@/components/ui/ai-chart";
import { StreamingSkeleton } from "@/components/ui/skeleton";
import type { MultiStreamEvent, MultiStepExecuted, PlanStep } from "@/services/api";
import type { ChartSpec } from "@/types";
import type { AnomalyResult } from "@/types";

export interface InvestigationResult {
  plan?: PlanStep[];
  steps?: MultiStepExecuted[];
  sections?: { title: string; content: string; type: "markdown" | "sql" | "json" }[];
  chartSpecs?: ChartSpec[];
  summary?: string;
  trace?: Record<string, unknown>;
  evaluation?: Record<string, unknown>;
  anomalies?: AnomalyResult;
}

interface StreamingOutputProps {
  result: InvestigationResult | null;
  streamEvent: MultiStreamEvent | null;
  isStreaming: boolean;
  streamStage: string;
  streamStep?: number;
  error?: string;
}

export function StreamingOutput({
  result, streamEvent, isStreaming, streamStage, streamStep: _streamStep, error,
}: StreamingOutputProps) {
  const { t } = useTranslation();

  const hasContent = result != null || streamEvent != null || error != null;

  if (!hasContent && !isStreaming) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <MonitorPlay className="w-10 h-10 text-[var(--text-muted)]/40 mb-3" strokeWidth={1} />
        <p className="text-xs text-[var(--text-muted)]">{t("inv.start-hint")}</p>
      </div>
    );
  }

  // Show skeleton during streaming while waiting for first content
  if (isStreaming && !hasContent) {
    return <StreamingSkeleton />;
  }

  // Determine user-friendly error message
  const getErrorMessage = (err: string) => {
    if (err.includes("Empty LLM response") || err.includes("empty response")) {
      return { message: t("ai.error-empty-response"), hint: t("ai.error-empty-hint"), showHint: true };
    }
    if (err.includes("JSON") || err.includes("parse")) {
      return { message: t("ai.error-json-parse"), hint: null, showHint: false };
    }
    return { message: err, hint: null, showHint: false };
  };

  const errorInfo = error ? getErrorMessage(error) : null;

  return (
    <div className="space-y-4">
      {/* Error — with user-friendly fallback */}
      {error && errorInfo && (
        <div className="border border-red-500/30 rounded-lg p-4 bg-red-500/5">
          <p className="text-xs text-red-400">{errorInfo.message}</p>
          {errorInfo.showHint && errorInfo.hint && (
            <p className="text-[10px] text-[var(--text-muted)] mt-1">{errorInfo.hint}</p>
          )}
          <details className="mt-2">
            <summary className="text-[10px] text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-secondary)]">
              {t("ai.error-technical-detail")}
            </summary>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono whitespace-pre-wrap">{error}</p>
          </details>
        </div>
      )}

      {/* Streaming plan */}
      {streamStage === "plan" && streamEvent?.plan && (
        <div className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
          <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-3">
            {t("inv.plan")}
          </h3>
          <div className="space-y-2">
            {(streamEvent.plan).map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold">
                  {step.step}
                </span>
                <span className="text-[var(--text-secondary)]">{step.purpose}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result plan */}
      {result?.plan && !streamEvent?.plan && (
        <div className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
          <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-3">
            {t("inv.plan")}
          </h3>
          <div className="space-y-2">
            {result.plan.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold">
                  {step.step}
                </span>
                <span className="text-[var(--text-secondary)]">{step.purpose}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary — shown first for user-friendly presentation */}
      {result?.summary && (
        <div className="border border-[var(--accent)]/20 rounded-lg p-4 bg-[var(--accent)]/5">
          <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
            {t("ai.executive-summary")}
          </h3>
          <div className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
            {result.summary}
          </div>
        </div>
      )}

      {/* Sections — key findings */}
      {result?.sections && result.sections.length > 0 && (
        <div className="space-y-3">
          {result.sections.map((section, i) => (
            <div key={i} className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
              <AnalysisSectionView section={section} />
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {result?.chartSpecs && result.chartSpecs.length > 0 && (
        <div className="space-y-3">
          {result.chartSpecs.map((chart, i) => (
            <div key={i} className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
              <AiChart spec={chart} />
            </div>
          ))}
        </div>
      )}

      {/* Steps — collapsible execution details */}
      {result?.steps && result.steps.length > 0 && (
        <details className="border border-[var(--border-default)] rounded-lg bg-[var(--bg-secondary)]">
          <summary className="px-4 py-3 text-xs font-semibold text-[var(--accent)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-primary)] transition-colors">
            {t("inv.plan")} ({result.steps.length} {t("ai.step")})
          </summary>
          <div className="px-4 pb-4">
            <StepResults steps={result.steps} />
          </div>
        </details>
      )}

      {/* Anomalies */}
      {result?.anomalies && (
        <div className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
          <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
            {t("ai.anomaly-detection")}
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {result.anomalies.summary.total_anomalies} {t("ai.anomalies-found")} · {result.anomalies.summary.columns_affected.length} {t("ai.columns-affected")}
          </p>
          {result.anomalies.anomalies && (
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              {result.anomalies.anomalies.length} {t("ai.anomalies-found")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
