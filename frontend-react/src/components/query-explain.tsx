"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ExplainResult } from "@/services/api";

interface QueryExplainProps {
  result: ExplainResult | null;
  isLoading: boolean;
  error: string | null;
}

export function QueryExplain({ result, isLoading, error }: QueryExplainProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-tertiary)] rounded-md border border-[var(--border-default)]">
        <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <span className="text-xs text-[var(--text-muted)]">{t("explain.loading")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-md">
        <p className="text-xs font-medium text-red-400 mb-1">{t("explain.error")}</p>
        <p className="text-xs text-red-300 font-mono whitespace-pre-wrap">{error}</p>
      </div>
    );
  }

  if (!result || result.plan.length === 0) return null;

  return (
    <div className="border border-[var(--border-default)] rounded-md overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-3 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-3 h-3 text-[var(--text-muted)] transition-transform ${expanded ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
            {t("explain.title")}
          </span>
        </div>
        <span className="text-[10px] text-[var(--text-muted)]">
          {result.plan.length} {t("explain.steps")}
        </span>
      </button>

      {expanded && (
        <div className="p-3 space-y-1">
          {result.plan.map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs"
            >
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-[10px] font-bold">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-[var(--text-primary)]">{step.operator}</span>
                {step.detail && step.detail !== step.operator && (
                  <p className="text-[var(--text-muted)] font-mono mt-0.5 break-all">
                    {step.detail}
                  </p>
                )}
              </div>
              {/* Connection line */}
              {i < result.plan.length - 1 && (
                <div className="absolute left-[19px] mt-6 w-px h-2 bg-[var(--border-default)]" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
