"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAnalysisStore, type ComparisonResult } from "@/stores/analysis-store";

function MetricCard({ label, old, new: newVal, delta }: { label: string; old: number; new: number; delta: number }) {
  return (
    <div className="flex items-center justify-between px-2 py-1.5 rounded bg-[var(--bg-primary)] border border-[var(--border-default)]">
      <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[var(--text-muted)]">{old}</span>
        <span className="text-[10px] text-[var(--text-muted)]">→</span>
        <span className="text-[10px] text-[var(--text-primary)]">{newVal}</span>
        {delta !== 0 && (
          <span className={`text-[10px] font-mono ${delta > 0 ? "text-green-400" : "text-red-400"}`}>
            {delta > 0 ? "+" : ""}{delta}
          </span>
        )}
      </div>
    </div>
  );
}

function SectionDiffRow({ title, change, old_content, new_content }: {
  title: string;
  change: string;
  old_content: string | null;
  new_content: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const colors: Record<string, string> = {
    added: "border-l-green-500 bg-green-500/5",
    removed: "border-l-red-500 bg-red-500/5",
    changed: "border-l-yellow-500 bg-yellow-500/5",
    unchanged: "border-l-transparent",
  };
  const badges: Record<string, { text: string; cls: string }> = {
    added: { text: "+", cls: "bg-green-500/20 text-green-400" },
    removed: { text: "-", cls: "bg-red-500/20 text-red-400" },
    changed: { text: "~", cls: "bg-yellow-500/20 text-yellow-400" },
    unchanged: { text: "=", cls: "bg-[var(--bg-tertiary)] text-[var(--text-muted)]" },
  };
  const badge = badges[change] || badges.unchanged;

  return (
    <div className={`border-l-2 ${colors[change] || ""} rounded`}>
      <button
        onClick={() => change !== "unchanged" && setExpanded(!expanded)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 text-left ${change === "unchanged" ? "cursor-default" : "cursor-pointer hover:bg-[var(--bg-secondary)]"}`}
      >
        <span className={`text-[9px] font-bold px-1 rounded ${badge.cls}`}>{badge.text}</span>
        <span className="text-xs text-[var(--text-primary)] truncate flex-1">{title}</span>
      </button>
      {expanded && change !== "unchanged" && (
        <div className="px-3 pb-2 space-y-1">
          {old_content !== null && (
            <div className="px-2 py-1 rounded bg-red-500/5 border border-red-500/20">
              <p className="text-[10px] text-red-300 font-mono whitespace-pre-wrap break-words">{old_content}</p>
            </div>
          )}
          {new_content !== null && (
            <div className="px-2 py-1 rounded bg-green-500/5 border border-green-500/20">
              <p className="text-[10px] text-green-300 font-mono whitespace-pre-wrap break-words">{new_content}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DiffPanel() {
  const { t } = useTranslation();
  const { runs, compareRuns } = useAnalysisStore();
  const [selectedA, setSelectedA] = useState<string | null>(null);
  const [selectedB, setSelectedB] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const successRuns = runs.filter((r) => r.status === "success");

  const handleCompare = () => {
    if (!selectedA || !selectedB) return;
    const diff = compareRuns(selectedA, selectedB);
    setResult(diff);
  };

  const runA = runs.find((r) => r.id === selectedA);
  const runB = runs.find((r) => r.id === selectedB);

  return (
    <div className="space-y-3">
      {/* Selector */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-[var(--text-muted)] block mb-1">{t("diff.run-a")} (old)</label>
          <select
            value={selectedA ?? ""}
            onChange={(e) => setSelectedA(e.target.value || null)}
            className="w-full px-2 py-1 text-xs bg-[var(--bg-primary)] border border-[var(--border-default)] rounded text-[var(--text-primary)]"
          >
            <option value="">—</option>
            {successRuns.map((r) => (
              <option key={r.id} value={r.id}>
                {r.question || r.table || r.mode} (v{r.version})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-[var(--text-muted)] block mb-1">{t("diff.run-b")} (new)</label>
          <select
            value={selectedB ?? ""}
            onChange={(e) => setSelectedB(e.target.value || null)}
            className="w-full px-2 py-1 text-xs bg-[var(--bg-primary)] border border-[var(--border-default)] rounded text-[var(--text-primary)]"
          >
            <option value="">—</option>
            {successRuns.map((r) => (
              <option key={r.id} value={r.id}>
                {r.question || r.table || r.mode} (v{r.version})
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={!selectedA || !selectedB}
        className="w-full px-3 py-1.5 text-xs rounded bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        {t("diff.compare")}
      </button>

      {/* Run labels */}
      {result && runA && runB && (
        <div className="flex gap-2 text-[10px] text-[var(--text-muted)]">
          <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-300 truncate flex-1">
            A: {runA.question || runA.table}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-300 truncate flex-1">
            B: {runB.question || runB.table}
          </span>
        </div>
      )}

      {/* Metrics */}
      {result && (
        <div className="space-y-1">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{t("diff.metrics")}</p>
          <MetricCard label={t("diff.tokens")} {...result.metrics_diff.tokens} />
          <MetricCard label={t("diff.llm-calls")} {...result.metrics_diff.llm_calls} />
          <MetricCard label={t("diff.row-count")} {...result.metrics_diff.row_count} />
        </div>
      )}

      {/* Section diffs */}
      {result && result.sections_diff.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{t("diff.sections")}</p>
          {result.sections_diff.map((s, i) => (
            <SectionDiffRow key={i} {...s} />
          ))}
        </div>
      )}

      {/* Summary */}
      {result && (
        <div className="flex items-center gap-3 px-2 py-1.5 rounded bg-[var(--bg-primary)] border border-[var(--border-default)]">
          <span className="text-[10px] text-green-400">+{result.summary.sections_added}</span>
          <span className="text-[10px] text-red-400">-{result.summary.sections_removed}</span>
          <span className="text-[10px] text-yellow-400">~{result.summary.sections_changed}</span>
          <span className="text-[10px] text-[var(--text-muted)]">={result.summary.sections_unchanged}</span>
          {result.summary.sql_changed && (
            <span className="text-[10px] text-yellow-400 ml-auto">SQL changed</span>
          )}
        </div>
      )}
    </div>
  );
}
