"use client";

import { useTranslation } from "react-i18next";
import { AnalysisSectionView } from "@/components/ai/analysis-section";
import { StepResults } from "@/components/ai/step-results";
import { AiChart } from "@/components/ui/ai-chart";
import type { AnalysisRun } from "@/stores/analysis-store";

interface RunSectionsProps {
  run: AnalysisRun;
}

export function RunSections({ run }: RunSectionsProps) {
  const { t } = useTranslation();

  if (!run.sections.length && !run.multiResult?.steps?.length && !run.chartSpecs?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-xs text-[var(--text-muted)]">{t("inv.no-sections")}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-3">
        {t("inv.sections")}
      </h3>

      <div className="space-y-3">
        {/* Multi-step results */}
        {run.multiResult?.steps && run.multiResult.steps.length > 0 && (
          <StepResults steps={run.multiResult.steps} />
        )}

        {/* Markdown sections */}
        {run.sections.map((section, i) => (
          <div key={i} className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
            <AnalysisSectionView section={section} />
          </div>
        ))}

        {/* Charts */}
        {run.chartSpecs.map((chart, i) => (
          <div key={i} className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
            <AiChart spec={chart} />
          </div>
        ))}

        {/* Executive summary */}
        {run.multiResult?.summary && (
          <div className="border border-[var(--accent)]/20 rounded-lg p-4 bg-[var(--accent)]/5">
            <h4 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
              {t("ai.executive-summary")}
            </h4>
            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
              {run.multiResult.summary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
