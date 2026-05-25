"use client";

import { useTranslation } from "react-i18next";
import type { AnalysisRun } from "@/stores/analysis-store";

interface RunEvaluationProps {
  run: AnalysisRun;
}

export function RunEvaluation({ run }: RunEvaluationProps) {
  const { t } = useTranslation();

  if (!run.evaluation) {
    return (
      <div className="text-center py-4">
        <p className="text-[10px] text-[var(--text-muted)]">{t("inv.no-evaluation")}</p>
      </div>
    );
  }

  const eval_ = run.evaluation;

  return (
    <div>
      <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-3">
        {t("inv.evaluation")}
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <div className="border border-[var(--border-default)] rounded-lg p-3 bg-[var(--bg-secondary)]">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{t("eval.confidence")}</p>
          <p className={`text-lg font-bold mt-0.5 ${eval_.confidence >= 0.7 ? "text-green-400" : "text-yellow-400"}`}>
            {Math.round(eval_.confidence * 100)}%
          </p>
        </div>
        <div className="border border-[var(--border-default)] rounded-lg p-3 bg-[var(--bg-secondary)]">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{t("ai.completeness")}</p>
          <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">{eval_.completeness}</p>
        </div>
        <div className="border border-[var(--border-default)] rounded-lg p-3 bg-[var(--bg-secondary)]">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{t("ai.accuracy")}</p>
          <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">{eval_.accuracy}</p>
        </div>
        <div className="border border-[var(--border-default)] rounded-lg p-3 bg-[var(--bg-secondary)]">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{t("ai.actionability")}</p>
          <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">{eval_.actionability}</p>
        </div>
      </div>

      {eval_.diagnostics.length > 0 && (
        <div className="mt-3 border border-[var(--border-default)] rounded-lg p-3 bg-[var(--bg-secondary)]">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5">{t("eval.diagnostics")}</p>
          <ul className="space-y-0.5">
            {eval_.diagnostics.map((d, i) => (
              <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                <span className="text-[var(--accent)] mt-0.5">•</span>
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      {eval_.suggested_improvements.length > 0 && (
        <div className="mt-3 border border-[var(--border-default)] rounded-lg p-3 bg-[var(--bg-secondary)]">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5">{t("eval.improvements")}</p>
          <ul className="space-y-0.5">
            {eval_.suggested_improvements.map((imp, i) => (
              <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                <span className="text-[var(--accent)] mt-0.5">→</span>
                {imp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
