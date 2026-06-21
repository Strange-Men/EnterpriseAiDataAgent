"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { renderSafeText } from "@/utils/safe-render";
import type { MultiStepExecuted } from "@/services/api";

interface StepResultsProps {
  steps: MultiStepExecuted[];
  isStreaming?: boolean;
  activeStep?: number;
}

export function StepResults({ steps, isStreaming, activeStep }: StepResultsProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  if (!steps.length) return null;

  const toggleCollapse = (index: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="mt-4 pt-3 border-t border-[var(--border-default)]">
      <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-3">
        {t("ai.step-result")} ({steps.length})
      </h3>
      <div className="space-y-2">
        {steps.map((step, i) => {
          const isActive = isStreaming && activeStep === step.step;
          const isCollapsed = collapsed.has(i);
          const isSuccess = step.status === "success";

          return (
            <div
              key={i}
              className={cn(
                "border border-[var(--border-default)] rounded-md overflow-hidden transition-all",
                "animate-slide-up",
                isActive && "animate-pulse-border"
              )}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Header row */}
              <button
                onClick={() => toggleCollapse(i)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors",
                  isSuccess ? "bg-green-500/5 hover:bg-green-500/10" : "bg-red-500/5 hover:bg-red-500/10"
                )}
              >
                {isSuccess ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                )}
                <span className="text-[10px] font-bold text-[var(--text-muted)]">
                  #{step.step}
                </span>
                <span className="text-xs text-[var(--text-secondary)] flex-1 truncate">
                  {step.purpose}
                </span>
                {step.row_count != null && isSuccess && (
                  <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                    {step.row_count} {t("sql.rows")}
                  </span>
                )}
                {step.data && step.data.length > 0 && (
                  isCollapsed ? (
                    <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                  )
                )}
              </button>

              {/* Expanded content */}
              {!isCollapsed && (
                <div>
                  {step.status === "error" && step.error && (
                    <div className="px-3 py-1.5 text-xs text-red-300 bg-red-500/5">
                      {renderSafeText(step.error, "Step execution failed")}
                    </div>
                  )}
                  {isSuccess && step.data && step.data.length > 0 && step.columns && (
                    <div className="overflow-x-auto max-h-40">
                      <table className="min-w-full text-[10px]">
                        <thead>
                          <tr>
                            {step.columns.map((c) => (
                              <th key={c} className="px-2 py-1 text-left font-semibold bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-b border-[var(--border-default)]">
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {step.data.slice(0, 5).map((row, ri) => (
                            <tr key={ri}>
                              {step.columns.map((c) => (
                                <td key={c} className="px-2 py-0.5 text-[var(--text-secondary)] border-b border-[var(--border-default)]/50 truncate max-w-[120px]">
                                  {String(row[c] ?? "")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {step.data.length > 5 && (
                        <p className="text-[10px] text-[var(--text-muted)] px-2 py-1">
                          +{step.data.length - 5} more rows
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
