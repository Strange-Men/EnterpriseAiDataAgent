"use client";

import { useTranslation } from "react-i18next";
import type { AnalysisMode } from "@/stores/analysis-store";

const MODES: { mode: AnalysisMode; key: string }[] = [
  { mode: "autonomous", key: "inv.mode.autonomous" },
  { mode: "full-analysis", key: "inv.mode.full" },
  { mode: "insights", key: "inv.mode.insights" },
  { mode: "explain", key: "inv.mode.explain" },
  { mode: "charts", key: "inv.mode.charts" },
  { mode: "anomalies", key: "inv.mode.anomalies" },
];

interface ModeSelectorProps {
  value: AnalysisMode;
  onChange: (mode: AnalysisMode) => void;
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-1">
      {MODES.map(({ mode, key }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`px-2 py-1 text-[10px] rounded-md border transition-colors ${
            value === mode
              ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)] font-medium"
              : "border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]"
          }`}
        >
          {t(key)}
        </button>
      ))}
    </div>
  );
}
