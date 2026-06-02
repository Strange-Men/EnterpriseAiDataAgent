"use client";

import { useTranslation } from "react-i18next";
import type { AnalysisRun } from "@/stores/analysis-store";

interface RunEvaluationProps {
  run: AnalysisRun;
}

function ConfidenceRing({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 70 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--error)";

  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--bg-tertiary)" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={radius} fill="none" stroke={color} strokeWidth="5"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s var(--ease-out)" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-[var(--text-primary)]">{pct}%</span>
      </div>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: string }) {
  const levelMap: Record<string, number> = { high: 90, medium: 60, low: 30, unknown: 15 };
  const pct = levelMap[value.toLowerCase()] ?? 50;
  const color = pct >= 70 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--error)";

  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-[10px] text-[var(--text-muted)]">{label}</span>
      <div className="flex-1 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-10 text-right text-[10px] capitalize text-[var(--text-secondary)]">{value}</span>
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

  return (
    <div>
      <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-4">
        {t("inv.evaluation")}
      </h3>

      {/* Confidence ring + metrics */}
      <div className="flex items-start gap-4 mb-4">
        <ConfidenceRing value={eval_.confidence} />
        <div className="flex-1 space-y-2 pt-1">
          <MetricBar label={t("ai.completeness")} value={eval_.completeness} />
          <MetricBar label={t("ai.accuracy")} value={eval_.accuracy} />
          <MetricBar label={t("ai.actionability")} value={eval_.actionability} />
        </div>
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
                {d}
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
                {imp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
