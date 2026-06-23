"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import type { TraceSnapshot } from "@/stores/analysis-store";

interface TraceTimelineProps {
  trace: TraceSnapshot;
}

interface PhaseGroup {
  phase: string;
  events: TraceSnapshot["events"];
}

export function TraceTimeline({ trace }: TraceTimelineProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  const totalTokens = trace.total_input_tokens + trace.total_output_tokens;
  const totalLatency = trace.events.reduce((sum, e) => sum + (e.latency_ms ?? 0), 0);
  const maxLatency = Math.max(...trace.events.map((e) => e.latency_ms ?? 0), 1);

  // Group events by phase
  const phases = useMemo<PhaseGroup[]>(() => {
    const map = new Map<string, TraceSnapshot["events"]>();
    trace.events.forEach((e) => {
      const phase = e.phase ?? "other";
      const arr = map.get(phase);
      if (arr) {
        arr.push(e);
      } else {
        map.set(phase, [e]);
      }
    });
    return Array.from(map.entries()).map(([phase, events]) => ({ phase, events }));
  }, [trace.events]);

  const togglePhase = (phase: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phase)) next.delete(phase);
      else next.add(phase);
      return next;
    });
  };

  if (!trace.events.length) return null;

  return (
    <div className="mt-4 pt-3 border-t border-[var(--border-default)]">
      {/* Summary line — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left mb-2 group"
      >
        <ChevronRight
          className={cn(
            "w-3 h-3 text-[var(--text-muted)] transition-transform",
            expanded && "rotate-90"
          )}
        />
        <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
          {t("analysis.trace")}
        </h3>
        <span className="text-xs text-[var(--text-muted)]">
          {trace.total_llm_calls} calls · {totalTokens} tokens · {(totalLatency / 1000).toFixed(1)}s
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="space-y-2">
          {phases.map(({ phase, events }) => {
            const phaseExpanded = expandedPhases.has(phase);
            const phaseLatency = events.reduce((s, e) => s + (e.latency_ms ?? 0), 0);
            const phaseTokens = events.reduce((s, e) => s + (e.input_tokens ?? 0) + (e.output_tokens ?? 0), 0);

            return (
              <div key={phase} className="border border-[var(--border-default)] rounded-md overflow-hidden">
                <button
                  onClick={() => togglePhase(phase)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                >
                  <ChevronRight
                    className={cn(
                      "w-3 h-3 text-[var(--text-muted)] transition-transform",
                      phaseExpanded && "rotate-90"
                    )}
                  />
                  <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                    {phase}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] ml-auto">
                    {events.length} calls · {phaseTokens} tok · {(phaseLatency / 1000).toFixed(2)}s
                  </span>
                </button>

                {phaseExpanded && (
                  <div className="px-2 py-1.5 space-y-1">
                    {events.map((event, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs group/item">
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            event.status === "success" ? "bg-green-400" : "bg-red-400"
                          )}
                          title={event.error ?? ""}
                        />
                        <span className="w-20 truncate text-[var(--text-secondary)] font-mono">
                          {event.operation}
                        </span>
                        <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              event.status === "success" ? "bg-[var(--accent)]" : "bg-red-400"
                            )}
                            style={{ width: `${Math.max((event.latency_ms / maxLatency) * 100, 4)}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-[var(--text-muted)]">{event.latency_ms}ms</span>
                        <span className="w-16 text-right text-[var(--text-muted)]">
                          {(event.input_tokens ?? 0) + (event.output_tokens ?? 0)} tok
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Guardrail violations */}
          {trace.guardrail_violations && trace.guardrail_violations.length > 0 && (
            <div className="px-3 py-2 bg-yellow-500/5 border border-yellow-500/20 rounded text-[10px] text-yellow-300">
              {trace.guardrail_violations.map((v, i) => (
                <div key={i}>⚠ {v}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
