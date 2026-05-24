"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TraceSnapshot } from "@/stores/analysis-store";

interface TraceTimelineProps {
  trace: TraceSnapshot;
}

export function TraceTimeline({ trace }: TraceTimelineProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (!trace.events.length) return null;

  const maxLatency = Math.max(...trace.events.map((e) => e.latency_ms), 1);

  return (
    <div className="mt-4 pt-3 border-t border-[var(--border-default)]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left mb-2"
      >
        <svg
          className={`w-3 h-3 text-[var(--text-muted)] transition-transform ${expanded ? "rotate-90" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
          {t("analysis.trace")}
        </h3>
        <span className="text-[10px] text-[var(--text-muted)] ml-auto">
          {trace.total_llm_calls} calls · {trace.total_input_tokens + trace.total_output_tokens} tokens
        </span>
      </button>

      {expanded && (
        <div className="space-y-1.5">
          {trace.events.map((event, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px]">
              {/* Status dot */}
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${event.status === "success" ? "bg-green-400" : "bg-red-400"}`} />

              {/* Operation label */}
              <span className="w-20 truncate text-[var(--text-secondary)] font-mono">
                {event.operation}
              </span>

              {/* Latency bar */}
              <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${event.status === "success" ? "bg-[var(--accent)]" : "bg-red-400"}`}
                  style={{ width: `${Math.max((event.latency_ms / maxLatency) * 100, 4)}%` }}
                />
              </div>

              {/* Stats */}
              <span className="w-12 text-right text-[var(--text-muted)]">{event.latency_ms}ms</span>
              <span className="w-16 text-right text-[var(--text-muted)]">
                {event.input_tokens + event.output_tokens}tok
              </span>
            </div>
          ))}

          {trace.guardrail_violations.length > 0 && (
            <div className="mt-2 px-2 py-1.5 bg-yellow-500/5 border border-yellow-500/20 rounded text-[10px] text-yellow-300">
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
