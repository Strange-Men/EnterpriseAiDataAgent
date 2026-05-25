"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAnalysisStore, type AnalysisRun } from "@/stores/analysis-store";

function TimelineNode({ run, isLast, onExpand }: {
  run: AnalysisRun;
  isLast: boolean;
  onExpand: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusColors: Record<string, string> = {
    success: "bg-green-500",
    error: "bg-red-500",
    running: "bg-yellow-500",
  };

  const d = new Date(run.timestamp);
  const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });

  return (
    <div className="flex gap-3">
      {/* Timeline track */}
      <div className="flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusColors[run.status] || "bg-[var(--bg-tertiary)]"}`} />
        {!isLast && <div className="w-px flex-1 bg-[var(--border-default)]" />}
      </div>

      {/* Content */}
      <div className="pb-4 flex-1 min-w-0">
        <button
          onClick={() => { setExpanded(!expanded); onExpand(); }}
          className="w-full text-left group"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--text-muted)]">{dateStr} {timeStr}</span>
            <span className="text-[10px] px-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
              v{run.version}
            </span>
          </div>
          <p className="text-xs text-[var(--text-primary)] truncate mt-0.5 group-hover:text-[var(--accent)] transition-colors">
            {run.question || run.table || run.mode}
          </p>
          {run.sections.length > 0 && (
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              {run.sections.length} sections
            </p>
          )}
        </button>

        {expanded && (
          <div className="mt-2 space-y-1 pl-1 border-l border-[var(--border-default)]">
            {run.sections.map((sec, i) => (
              <div key={i} className="px-2 py-1 rounded bg-[var(--bg-primary)]">
                <p className="text-[10px] text-[var(--text-muted)]">{sec.title}</p>
              </div>
            ))}
            {run.trace && (
              <div className="flex gap-2 px-2 py-1 text-[10px] text-[var(--text-muted)]">
                <span>{run.trace.total_llm_calls} calls</span>
                <span>{run.trace.total_output_tokens} tokens</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function TimelineEvolution({ runId, onClose }: { runId: string; onClose: () => void }) {
  const { t } = useTranslation();
  const getEvolutionChain = useAnalysisStore((s) => s.getEvolutionChain);
  const chain = getEvolutionChain(runId);

  if (chain.length <= 1) {
    return (
      <div className="p-3 text-center">
        <p className="text-xs text-[var(--text-muted)]">{t("timeline.no-evolution")}</p>
        <button onClick={onClose} className="mt-2 text-[10px] text-[var(--accent)] hover:underline">
          {t("timeline.close")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
          {t("timeline.evolution")} ({chain.length})
        </p>
        <button onClick={onClose} className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)]">
          ✕
        </button>
      </div>
      {chain.map((run, i) => (
        <TimelineNode
          key={run.id}
          run={run}
          isLast={i === chain.length - 1}
          onExpand={() => {}}
        />
      ))}
    </div>
  );
}
