"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAnalysisStore, type AnalysisRun } from "@/stores/analysis-store";
import { generateReport } from "@/services/api";
import { downloadBlob } from "@/utils/download";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ReportDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const runs = useAnalysisStore((s) => s.runs);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState("Analysis Report");
  const [includeTrace, setIncludeTrace] = useState(false);
  const [includeSamples, setIncludeSamples] = useState(true);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const savedRuns = [...runs].filter((r) => r.saved).reverse();
  const completedRuns = [...runs].filter((r) => r.status === "success" && !r.saved).reverse();

  const toggleRun = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerate = async () => {
    const selectedRuns = runs.filter((r) => selectedIds.has(r.id));
    if (selectedRuns.length === 0) return;
    setGenerating(true);
    setError(null);
    try {
      const result = await generateReport(selectedRuns, {
        title,
        includeTrace,
        includeDataSamples: includeSamples,
      });
      if (!mountedRef.current) return;
      setMarkdown(result.markdown);
    } catch (e: unknown) {
      if (!mountedRef.current) return;
      setError(e instanceof Error ? e.message : "Report generation failed");
    }
    if (mountedRef.current) setGenerating(false);
  };

  const handleDownload = () => {
    if (!markdown) return;
    downloadBlob(
      `${title.toLowerCase().replace(/\s+/g, "-")}.md`,
      markdown,
      "text/markdown"
    );
  };

  const RunCheckbox = ({ run }: { run: AnalysisRun }) => (
    <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--bg-tertiary)] cursor-pointer">
      <input
        type="checkbox"
        checked={selectedIds.has(run.id)}
        onChange={() => toggleRun(run.id)}
        className="accent-[var(--accent)]"
      />
      <span className="text-xs text-[var(--text-primary)] truncate flex-1">
        {run.question || run.table || run.mode}
      </span>
      <span className="text-[10px] text-[var(--text-muted)]">
        {run.mode}
      </span>
    </label>
  );

  // ESC to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-xl w-full max-w-2xl p-4 space-y-4 max-h-[85vh] overflow-y-auto">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {t("report.generate")}
        </h3>

        {/* Title */}
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">
            {t("report.title")}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-default)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Options */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <input
              type="checkbox"
              checked={includeTrace}
              onChange={(e) => setIncludeTrace(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            {t("report.include-trace")}
          </label>
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <input
              type="checkbox"
              checked={includeSamples}
              onChange={(e) => setIncludeSamples(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            {t("report.include-samples")}
          </label>
        </div>

        {/* Run selection */}
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">
            {t("report.select-runs")}
          </label>
          <div className="border border-[var(--border-default)] rounded-md max-h-40 overflow-y-auto">
            {savedRuns.length > 0 && (
              <div className="p-1.5">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider px-2 mb-1">
                  {t("analysis.saved-runs")}
                </p>
                {savedRuns.map((run) => (
                  <RunCheckbox key={run.id} run={run} />
                ))}
              </div>
            )}
            {completedRuns.length > 0 && (
              <div className="p-1.5 border-t border-[var(--border-default)]">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider px-2 mb-1">
                  {t("analysis.recent-runs")}
                </p>
                {completedRuns.map((run) => (
                  <RunCheckbox key={run.id} run={run} />
                ))}
              </div>
            )}
            {savedRuns.length === 0 && completedRuns.length === 0 && (
              <p className="text-xs text-[var(--text-muted)] p-3 text-center">{t("report.empty")}</p>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Preview */}
        {markdown && (
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-1">
              {t("report.preview")}
            </label>
            <div className="border border-[var(--border-default)] rounded-md p-3 max-h-60 overflow-y-auto prose prose-sm prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {t("table.cancel")}
          </button>
          {!markdown ? (
            <button
              onClick={handleGenerate}
              disabled={generating || selectedIds.size === 0}
              className="px-3 py-1.5 text-xs bg-[var(--accent)]/10 text-[var(--accent)] rounded hover:bg-[var(--accent)]/20 transition-colors disabled:opacity-50"
            >
              {generating ? t("report.generating") : t("report.generate")}
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs bg-[var(--accent)]/10 text-[var(--accent)] rounded hover:bg-[var(--accent)]/20 transition-colors"
            >
              {t("report.download")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
