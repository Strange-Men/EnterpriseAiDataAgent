"use client";

import { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { AnalysisSectionView } from "@/components/ai/analysis-section";
import { StepResults } from "@/components/ai/step-results";
import { AiChart } from "@/components/ui/ai-chart";
import { renderSafeText } from "@/utils/safe-render";
import type { AnalysisRun } from "@/stores/analysis-store";

const MAX_PREVIEW_ROWS = 20;

interface RunSectionsProps {
  run: AnalysisRun;
}

/**
 * Extract key findings from sections by looking for a section with title
 * containing "关键发现" or "Key Findings".
 */
function extractKeyFindings(sections: AnalysisRun["sections"]): string | null {
  if (!Array.isArray(sections)) return null;
  const findingsSection = sections.find((s) => {
    if (!s || typeof s !== "object") return false;
    const title = (s.title || "").toLowerCase();
    return title.includes("关键发现") || title.includes("key findings") || title.includes("key finding");
  });
  if (findingsSection && typeof findingsSection.content === "string" && findingsSection.content.trim()) {
    return findingsSection.content;
  }
  return null;
}

/**
 * Extract the result table from the last successful step.
 * Returns { columns, data } or null.
 */
function extractResultTable(run: AnalysisRun): { columns: string[]; data: Record<string, unknown>[] } | null {
  if (!Array.isArray(run.multiResult?.steps) || run.multiResult!.steps!.length === 0) {
    return null;
  }
  // Find the last successful step with data
  const steps = run.multiResult!.steps!;
  for (let i = steps.length - 1; i >= 0; i--) {
    const step = steps[i];
    if (step && step.status === "success" && Array.isArray(step.data) && step.data.length > 0 && Array.isArray(step.columns) && step.columns.length > 0) {
      return { columns: step.columns, data: step.data };
    }
  }
  return null;
}

/**
 * Extract all SQL statements from multi-step results.
 * Returns array of { step, purpose, sql } or empty array.
 */
function extractAllSql(run: AnalysisRun): { step: number; purpose: string; sql: string }[] {
  if (!Array.isArray(run.multiResult?.steps)) return [];
  return run.multiResult!.steps!
    .filter((s) => s && typeof s.sql === "string" && s.sql.trim().length > 0)
    .map((s) => ({ step: s.step, purpose: s.purpose, sql: s.sql }));
}

export function RunSections({ run }: RunSectionsProps) {
  const { t } = useTranslation();
  const [stepsCollapsed, setStepsCollapsed] = useState(true);
  const [sqlAppendixCollapsed, setSqlAppendixCollapsed] = useState(true);
  const [sqlCopied, setSqlCopied] = useState(false);

  const hasSections = Array.isArray(run.sections) && run.sections.length > 0;
  const hasSteps = Array.isArray(run.multiResult?.steps) && run.multiResult!.steps!.length > 0;
  const hasCharts = Array.isArray(run.chartSpecs) && run.chartSpecs.length > 0;

  // Extract key findings, result table, and SQL
  const keyFindings = useMemo(() => extractKeyFindings(run.sections), [run.sections]);
  const resultTable = useMemo(() => extractResultTable(run), [run]);
  const allSql = useMemo(() => extractAllSql(run), [run]);

  const handleCopySql = useCallback(() => {
    if (allSql.length === 0) return;
    const sqlText = allSql
      .map((s) => `-- Step ${s.step}: ${s.purpose}\n${s.sql}`)
      .join("\n\n");
    navigator.clipboard.writeText(sqlText).then(() => {
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 2000);
    });
  }, [allSql]);

  // Filter out the key findings section from regular sections to avoid duplication
  const remainingSections = useMemo(() => {
    if (!hasSections) return [];
    return run.sections.filter((s) => {
      if (!s || typeof s !== "object") return true;
      const title = (s.title || "").toLowerCase();
      return !(title.includes("关键发现") || title.includes("key findings") || title.includes("key finding"));
    });
  }, [run.sections, hasSections]);

  return (
    <div>
      <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-3">
        {t("inv.sections")}
      </h3>

      <div className="space-y-3">
        {/* Executive summary — first */}
        {run.multiResult?.summary && typeof run.multiResult.summary === "string" ? (
          <div className="border border-[var(--accent)]/20 rounded-lg p-4 bg-[var(--accent)]/5">
            <h4 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
              {t("ai.executive-summary")}
            </h4>
            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
              {run.multiResult.summary}
            </p>
          </div>
        ) : (
          <div className="border border-dashed border-[var(--border-default)] rounded-lg p-4 text-center">
            <p className="text-xs text-[var(--text-muted)]">
              {t("inv.summary-empty")}
            </p>
            <p className="text-xs text-[var(--text-muted)]/60 mt-1">
              {t("inv.summary-empty-hint")}
            </p>
          </div>
        )}

        {/* Key Findings — after summary */}
        {keyFindings ? (
          <div className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
            <h4 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-1">
              {t("inv.key-findings")}
            </h4>
            <p className="text-[10px] text-[var(--text-muted)] mb-2">
              {t("inv.key-findings-desc")}
            </p>
            <div className="ai-markdown-content">
              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                {keyFindings}
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-[var(--border-default)] rounded-lg p-4 text-center">
            <p className="text-xs text-[var(--text-muted)]">
              {t("inv.key-findings-empty")}
            </p>
            <p className="text-xs text-[var(--text-muted)]/60 mt-1">
              {t("inv.key-findings-empty-hint")}
            </p>
          </div>
        )}

        {/* Main Result Table — after key findings */}
        {resultTable ? (
          <div className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
            <h4 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-1">
              {t("inv.main-result")}
            </h4>
            <p className="text-[10px] text-[var(--text-muted)] mb-2">
              {t("inv.main-result-desc")}
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border-collapse border border-[var(--border-default)]">
                <thead>
                  <tr>
                    {resultTable.columns.map((col, i) => (
                      <th key={i} className="px-3 py-1.5 text-left font-semibold bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultTable.data.slice(0, MAX_PREVIEW_ROWS).map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {resultTable.columns.map((col, colIdx) => {
                        const value = row[col];
                        const displayValue = value == null ? "" : String(value);
                        const truncated = displayValue.length > 50 ? displayValue.slice(0, 50) + "..." : displayValue;
                        return (
                          <td key={colIdx} className="px-3 py-1.5 border border-[var(--border-default)] text-[var(--text-secondary)]">
                            {truncated}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {resultTable.data.length > MAX_PREVIEW_ROWS && (
              <p className="text-[10px] text-[var(--text-muted)] mt-2 text-center">
                {t("inv.main-result-rows", { shown: MAX_PREVIEW_ROWS, total: resultTable.data.length })}
                {" · "}
                {t("inv.main-result-export-hint")}
              </p>
            )}
          </div>
        ) : (
          <div className="border border-dashed border-[var(--border-default)] rounded-lg p-4 text-center">
            <p className="text-xs text-[var(--text-muted)]">
              {t("inv.main-result-empty")}
            </p>
            <p className="text-xs text-[var(--text-muted)]/60 mt-1">
              {t("inv.main-result-empty-hint")}
            </p>
          </div>
        )}

        {/* Multi-step results — collapsible, default collapsed */}
        {hasSteps && (
          <div className="border border-[var(--border-default)] rounded-lg overflow-hidden">
            <button
              onClick={() => setStepsCollapsed(!stepsCollapsed)}
              className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-[var(--bg-secondary)] transition-colors"
            >
              {stepsCollapsed ? (
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
              )}
              <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
                {t("ai.step-result")} ({run.multiResult!.steps!.length})
              </span>
            </button>
            {!stepsCollapsed && (
              <div className="px-4 pb-4">
                <StepResults steps={run.multiResult!.steps!} />
              </div>
            )}
          </div>
        )}

        {/* Markdown sections (excluding key findings) */}
        {remainingSections.length > 0 && remainingSections.map((section, i) => {
          // Guard: ensure section is a valid object with string content
          if (!section || typeof section !== "object") return null;
          const safeSection = {
            title: renderSafeText(section.title, `Section ${i + 1}`),
            content: renderSafeText(section.content, ""),
            type: section.type || "markdown" as const,
          };
          if (!safeSection.content) return null;
          return (
            <div key={i} className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
              <AnalysisSectionView section={safeSection} />
            </div>
        )})}

        {/* Charts */}
        {hasCharts && run.chartSpecs.map((chart, i) => (
          <div key={i} className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-secondary)]">
            <AiChart spec={chart} />
          </div>
        ))}
      </div>

      {/* SQL Appendix — collapsed by default */}
      <div className="mt-4 border border-[var(--border-default)] rounded-lg overflow-hidden">
        <button
          onClick={() => setSqlAppendixCollapsed(!sqlAppendixCollapsed)}
          className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-[var(--bg-secondary)] transition-colors"
        >
          {sqlAppendixCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
          )}
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
            {t("inv.sql-appendix")}
          </span>
          <span className="text-xs text-[var(--text-muted)] ml-auto">
            {allSql.length > 0
              ? `${allSql.length} SQL`
              : t("inv.sql-appendix-empty")}
          </span>
        </button>
        {!sqlAppendixCollapsed && (
          <div className="px-4 pb-4 space-y-3">
            <p className="text-xs text-[var(--text-muted)]">
              {t("inv.sql-appendix-desc")}
            </p>
            {allSql.length > 0 ? (
              <>
                <div className="flex justify-end">
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-default)] rounded-md hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    {sqlCopied ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {sqlCopied ? t("inv.copy-sql-success") : t("inv.copy-sql")}
                  </button>
                </div>
                {allSql.map((s, i) => (
                  <div key={i} className="border border-[var(--border-default)] rounded-md overflow-hidden">
                    <div className="px-3 py-1.5 bg-[var(--bg-tertiary)]/50 text-xs text-[var(--text-muted)]">
                      Step {s.step}: {s.purpose}
                    </div>
                    <pre className="px-3 py-2 text-xs text-[var(--text-secondary)] font-mono whitespace-pre-wrap overflow-x-auto bg-[var(--bg-primary)]">
                      {s.sql}
                    </pre>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-xs text-[var(--text-muted)] text-center py-2">
                {t("inv.sql-appendix-empty")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
