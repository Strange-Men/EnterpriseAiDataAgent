"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAnalysisStore, type AnalysisRun } from "@/stores/analysis-store";
import { AnalysisSectionView } from "@/components/ai/analysis-section";
import { StepResults } from "@/components/ai/step-results";
import { TraceTimeline } from "@/components/ai/trace-timeline";
import { AiChart } from "@/components/ui/ai-chart";

// ── Helpers ───────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function modeIcon(mode: string): string {
  switch (mode) {
    case "explain": return "E";
    case "insights": return "I";
    case "charts": return "C";
    case "full-analysis": return "F";
    case "autonomous": return "A";
    default: return "?";
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "success": return "text-green-400";
    case "error": return "text-red-400";
    case "running": return "text-yellow-400";
    default: return "text-[var(--text-muted)]";
  }
}

// ── History Item ──────────────────────────────────────────────

function HistoryItem({
  run,
  isActive,
  onClick,
}: {
  run: AnalysisRun;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
        isActive
          ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30"
          : "bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--accent)]/50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${
          isActive ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
        }`}>
          {modeIcon(run.mode)}
        </span>
        <span className="text-xs text-[var(--text-primary)] truncate flex-1">
          {run.question || run.table || run.mode}
        </span>
        <span className={`text-[10px] ${statusColor(run.status)}`}>●</span>
        <span className="text-[10px] text-[var(--text-muted)]">{formatTime(run.timestamp)}</span>
      </div>
    </button>
  );
}

// ── Run Detail ────────────────────────────────────────────────

function RunDetail({ run }: { run: AnalysisRun }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {/* Sections */}
      {run.sections.map((section, i) => (
        <AnalysisSectionView key={i} section={section} />
      ))}

      {/* Charts */}
      {run.chartSpecs.length > 0 && (
        <div className="pt-2 border-t border-[var(--border-default)] space-y-4">
          {run.chartSpecs.map((spec, i) => (
            <AiChart key={i} spec={spec} />
          ))}
        </div>
      )}

      {/* Multi-step results */}
      {Boolean(run.multiResult?.steps?.length) && run.multiResult?.steps && (
        <StepResults steps={run.multiResult.steps} />
      )}

      {/* Summary */}
      {run.multiResult?.summary && (
        <div className="pt-2 border-t border-[var(--border-default)]">
          <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
            {t("ai.executive-summary")}
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">{run.multiResult.summary}</p>
        </div>
      )}

      {/* Trace */}
      {run.trace && <TraceTimeline trace={run.trace} />}

      {/* Error */}
      {run.error && (
        <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-md">
          <p className="text-xs text-red-300">{run.error}</p>
        </div>
      )}
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────

export function AnalysisWorkspacePanel() {
  const { t } = useTranslation();
  const { runs, activeRunId, setActiveRun, clearHistory } = useAnalysisStore();
  const [showHistory, setShowHistory] = useState(true);

  const activeRun = runs.find((r) => r.id === activeRunId) ?? null;
  const recentRuns = [...runs].reverse();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-default)]">
        <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
          {t("analysis.workspace")}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
              showHistory
                ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t("analysis.history")}
          </button>
          {runs.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] hover:text-red-400 transition-colors"
              title="Clear history"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Session history */}
        {showHistory && recentRuns.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              {t("analysis.recent-runs")}
            </p>
            {recentRuns.map((run) => (
              <HistoryItem
                key={run.id}
                run={run}
                isActive={run.id === activeRunId}
                onClick={() => setActiveRun(run.id)}
              />
            ))}
          </div>
        )}

        {/* Active run detail */}
        {activeRun ? (
          <RunDetail run={activeRun} />
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm text-[var(--text-muted)]">{t("analysis.no-selection")}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">{t("analysis.run-hint")}</p>
          </div>
        )}

        {/* Empty state */}
        {runs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm text-[var(--text-muted)]">{t("analysis.no-history")}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">{t("analysis.start-hint")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
