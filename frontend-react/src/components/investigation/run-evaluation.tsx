"use client";

import { useTranslation } from "react-i18next";
import { renderSafeText } from "@/utils/safe-render";
import type { AnalysisRun } from "@/stores/analysis-store";

interface RunEvaluationProps {
  run: AnalysisRun;
}

function MetricBar({ label, value }: { label: string; value: string }) {
  const safeValue = renderSafeText(value, "unknown");
  const levelMap: Record<string, number> = { high: 90, medium: 60, low: 30, unknown: 15 };
  const pct = levelMap[safeValue.toLowerCase()] ?? 50;
  const color = pct >= 70 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--error)";

  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-xs text-[var(--text-muted)]">{label}</span>
      <div className="flex-1 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-12 text-right text-xs capitalize text-[var(--text-secondary)]">{safeValue}</span>
    </div>
  );
}

export function RunEvaluation({ run }: RunEvaluationProps) {
  const { t } = useTranslation();

  if (!run.evaluation) {
    return (
      <div className="text-center py-8">
        <p className="text-xs text-[var(--text-muted)]">{t("inv.no-evaluation")}</p>
      </div>
    );
  }

  const eval_ = run.evaluation;
  const confidencePct = Math.round(eval_.confidence * 100);
  const confidenceColor = confidencePct >= 70 ? "text-[var(--success)]" : confidencePct >= 40 ? "text-[var(--warning)]" : "text-[var(--error)]";

  return (
    <div>
      <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-3">
        {t("inv.evaluation")}
      </h3>

      {/* Confidence — simplified as number + text */}
      <div className="mb-3 border border-[var(--border-default)] rounded-lg p-3 bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-[var(--text-muted)]">{t("eval.confidence")}</span>
          <span className={`text-lg font-bold ${confidenceColor}`}>{confidencePct}%</span>
        </div>
        <p className="text-[10px] text-[var(--text-muted)]">
          {confidencePct >= 70 ? t("ai.high-confidence") : confidencePct >= 40 ? t("ai.medium-confidence") : t("ai.low-confidence")}
        </p>
      </div>

      {/* Metrics */}
      <div className="mb-3 space-y-2">
        <MetricBar label={t("ai.completeness")} value={eval_.completeness} />
        <MetricBar label={t("ai.accuracy")} value={eval_.accuracy} />
        <MetricBar label={t("ai.actionability")} value={eval_.actionability} />
      </div>

      {/* Diagnostics */}
      {eval_.diagnostics && eval_.diagnostics.length > 0 && (
        <div className="mb-3 border border-[var(--border-default)] rounded-lg p-3 bg-[var(--bg-secondary)]">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
            {t("eval.diagnostics")}
          </p>
          <ul className="space-y-0.5">
            {eval_.diagnostics.map((d: string, i: number) => (
              <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                <span className="text-[var(--accent)] mt-0.5">•</span>
                {renderSafeText(d, "")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested improvements */}
      {eval_.suggested_improvements && eval_.suggested_improvements.length > 0 && (
        <div className="border border-[var(--border-default)] rounded-lg p-3 bg-[var(--bg-secondary)]">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
            {t("eval.improvements")}
          </p>
          <ul className="space-y-0.5">
            {eval_.suggested_improvements.map((imp: string, i: number) => (
              <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                <span className="text-[var(--accent)] mt-0.5">→</span>
                {renderSafeText(imp, "")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
