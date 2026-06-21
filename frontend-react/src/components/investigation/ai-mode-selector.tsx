"use client";

import { useTranslation } from "react-i18next";
import { isFeatureEnabled } from "@/config/features";
import type { AnalysisMode } from "@/stores/analysis-store";

interface ModeEntry {
  mode: AnalysisMode;
  key: string;
  experimental?: boolean;
}

// Core modes are always visible; experimental modes gated by feature flags
const ALL_MODES: ModeEntry[] = [
  { mode: "autonomous", key: "inv.mode.autonomous" },
  { mode: "full-analysis", key: "inv.mode.full", experimental: true },
  { mode: "insights", key: "inv.mode.insights" },
  { mode: "explain", key: "inv.mode.explain" },
  { mode: "charts", key: "inv.mode.charts", experimental: true },
  { mode: "anomalies", key: "inv.mode.anomalies", experimental: true },
];

function isModeVisible(entry: ModeEntry): boolean {
  if (!entry.experimental) return true;
  if (entry.mode === "autonomous") return isFeatureEnabled("showAutonomousMode");
  if (entry.mode === "full-analysis") return isFeatureEnabled("showFullAnalysisMode");
  if (entry.mode === "charts") return isFeatureEnabled("showChartsMode");
  if (entry.mode === "anomalies") return isFeatureEnabled("showAnomaliesMode");
  return false;
}

interface ModeSelectorProps {
  value: AnalysisMode;
  onChange: (mode: AnalysisMode) => void;
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  const { t } = useTranslation();
  const visibleModes = ALL_MODES.filter(isModeVisible);

  return (
    <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Analysis mode">
      {visibleModes.map(({ mode, key }) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={value === mode}
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
