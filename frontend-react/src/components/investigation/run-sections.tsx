"use client";

import { useTranslation } from "react-i18next";
import { AnalysisSectionView } from "@/components/ai/analysis-section";
import { StepResults } from "@/components/ai/step-results";
import { AiChart } from "@/components/ui/ai-chart";
import { renderSafeText } from "@/utils/safe-render";
import type { AnalysisRun } from "@/stores/analysis-store";

interface RunSectionsProps {
  run: AnalysisRun;
}

export function RunSections({ run }: RunSectionsProps) {
  const { t } = useTranslation();

  const hasSections = Array.isArray(run.sections) && run.sections.length > 0;
  const hasSteps = Array.isArray(run.multiResult?.steps) && run.multiResult!.steps!.length > 0;
  const hasCharts = Array.isArray(run.chartSpecs) && run.chartSpecs.length > 0;

  return (
    <div>
      <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-3">
        {t("inv.sections")}
      </h3>

      <div className="space-y-3">
        {/* Executive summary — first */}
        {run.multiResult?.summary && typeof run.multiResult.summary === "string" ? (
          <div className="border border-[var(--accent)]/20 rounded-lg p-4 bg-[var(--accent)]/5">
            <h4 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
              {t("ai.executive-summary")}
            </h4>
            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
              {run.multiResult.summary}
            </p>
          </div>
        ) : (
          <div className="border border-dashed border-[var(--border-default)] rounded-lg p-4 text-center">
            <p className="text-xs text-[var(--text-muted)]">
              {t("inv.summary-empty")}
            </p>
            <p className="text-xs text-[var(--text-muted)]/60 mt-1">
              {t("inv.summary-empty-hint")}
            </p>
          </div>
        )}

        {/* Multi-step results */}
        {hasSteps && (
          <StepResults steps={run.multiResult!.steps!} />
        )}

        {/* Markdown sections */}
        {hasSections && run.sections.map((section, i) => {
          // Guard: ensure section is a valid object with string content
          if (!section || typeof section !== "object") return null;
          const safeSection = {
            title: renderSafeText(section.title, `Section ${i + 1}`),
            content: renderSafeText(section.content, ""),
            type: section.type || "markdown" as const,
          };
          if (!safeSection.content) return null;
          return (
            <div key={i} className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
              <AnalysisSectionView section={safeSection} />
            </div>
        )})}

        {/* Charts */}
        {hasCharts && run.chartSpecs.map((chart, i) => (
          <div key={i} className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
            <AiChart spec={chart} />
          </div>
        ))}
      </div>
    </div>
  );
}
