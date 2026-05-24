"use client";

import { useTranslation } from "react-i18next";
import type { MultiStepExecuted } from "@/services/api";

interface StepResultsProps {
  steps: MultiStepExecuted[];
}

export function StepResults({ steps }: StepResultsProps) {
  const { t } = useTranslation();

  if (!steps.length) return null;

  return (
    <div className="mt-4 pt-3 border-t border-[var(--border-default)]">
      <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-3">
        {t("ai.step-result")}
      </h3>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="border border-[var(--border-default)] rounded-md overflow-hidden">
            <div className={`flex items-center gap-2 px-3 py-1.5 ${step.status === "success" ? "bg-green-500/5" : "bg-red-500/5"}`}>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${step.status === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                {t("ai.step")} {step.step}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">{step.purpose}</span>
              {step.row_count != null && step.status === "success" && (
                <span className="text-[10px] text-[var(--text-muted)] ml-auto">{step.row_count} {t("sql.rows")}</span>
              )}
            </div>
            {step.status === "error" && step.error && (
              <div className="px-3 py-1.5 text-xs text-red-300 bg-red-500/5">
                {step.error}
              </div>
            )}
            {step.status === "success" && step.data && step.data.length > 0 && step.columns && (
              <div className="overflow-x-auto max-h-40">
                <table className="min-w-full text-[10px]">
                  <thead>
                    <tr>
                      {step.columns.map((c) => (
                        <th key={c} className="px-2 py-1 text-left font-semibold bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-b border-[var(--border-default)]">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {step.data.slice(0, 5).map((row, ri) => (
                      <tr key={ri}>
                        {step.columns!.map((c) => (
                          <td key={c} className="px-2 py-0.5 text-[var(--text-secondary)] border-b border-[var(--border-default)]/50 truncate max-w-[120px]">
                            {String(row[c] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {step.data.length > 5 && (
                  <p className="text-[10px] text-[var(--text-muted)] px-2 py-1">+{step.data.length - 5} more rows</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
