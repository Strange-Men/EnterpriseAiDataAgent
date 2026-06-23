"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { downloadBlob } from "@/utils/download";
import type { AnalysisSection } from "./analysis-section";

// ── Icons ─────────────────────────────────────────────────────
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function ExportIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

interface AnalysisHeaderProps {
  mode: string;
  tableName?: string;
  hasResults: boolean;
  sections: AnalysisSection[];
  rawData: unknown;
  isLoading: boolean;
  onRun?: () => void;
  onClose?: () => void;
}

const MODE_LABELS: Record<string, string> = {
  "full-analysis": "ai.full-analysis",
  autonomous: "ai.autonomous-btn",
  explain: "ai.explain-title",
  insights: "ai.insights-title",
  charts: "ai.charts-title",
};

export function AnalysisHeader({
  mode, tableName, hasResults, sections, rawData, isLoading, onRun, onClose,
}: AnalysisHeaderProps) {
  const { t } = useTranslation();

  const handleCopyAll = useCallback(() => {
    const text = sections.map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n");
    navigator.clipboard.writeText(text).then(
      () => toast.success(t("ai.copied")),
      () => toast.error(t("ai.copy-failed"))
    );
  }, [sections, t]);

  const handleExportMd = useCallback(() => {
    const md = sections.map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n---\n\n");
    downloadBlob(`ai-analysis-${tableName || "query"}.md`, md, "text/markdown");
    toast.success(t("ai.exported-md"));
  }, [sections, tableName, t]);

  const handleExportJson = useCallback(() => {
    if (!rawData) return;
    const json = JSON.stringify(rawData, null, 2);
    downloadBlob(`ai-analysis-${tableName || "query"}.json`, json, "application/json");
    toast.success(t("ai.exported-json"));
  }, [rawData, tableName, t]);

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border-default)]">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
          {t(MODE_LABELS[mode] || mode)}
        </span>
        {tableName && (
          <span className="text-xs text-[var(--text-muted)] font-mono bg-[var(--bg-primary)] px-1.5 py-0.5 rounded">
            {tableName}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {!hasResults && !isLoading && onRun && (
          <button
            onClick={onRun}
            className="px-2.5 py-1 text-xs bg-[var(--accent)] text-[var(--bg-primary)] rounded-md hover:opacity-90 transition-opacity font-medium"
          >
            {t("ai.run")}
          </button>
        )}
        {sections.length > 0 && (
          <>
            <button
              onClick={handleCopyAll}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              title={t("ai.copy-all")}
            >
              <CopyIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleExportMd}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              title={t("ai.export-md")}
            >
              <ExportIcon className="w-3.5 h-3.5" />
            </button>
            {rawData && (
              <button
                onClick={handleExportJson}
                className="px-1.5 py-0.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] border border-[var(--border-default)] rounded transition-colors"
                title={t("ai.export-json")}
              >
                JSON
              </button>
            )}
          </>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors ml-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
