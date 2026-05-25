"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAnalysisStore, type AnalysisRun } from "@/stores/analysis-store";
import { useTemplateStore } from "@/stores/template-store";
import { AnalysisSectionView } from "@/components/ai/analysis-section";
import { StepResults } from "@/components/ai/step-results";
import { TraceTimeline } from "@/components/ai/trace-timeline";
import { AiChart } from "@/components/ui/ai-chart";
import { SaveTemplateDialog } from "@/components/ai/save-template-dialog";
import { ApplyTemplateDialog } from "@/components/ai/apply-template-dialog";
import { ReportDialog } from "@/components/ai/report-dialog";

// ── Helpers ───────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function modeIcon(mode: string): string {
  switch (mode) {
    case "explain": return "E";
    case "insights": return "I";
    case "charts": return "C";
    case "full-analysis": return "F";
    case "autonomous": return "A";
    default: return "?";
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "success": return "text-green-400";
    case "error": return "text-red-400";
    case "running": return "text-yellow-400";
    default: return "text-[var(--text-muted)]";
  }
}

// ── History Item ──────────────────────────────────────────────

function HistoryItem({
  run,
  isActive,
  onClick,
  onToggleSave,
}: {
  run: AnalysisRun;
  isActive: boolean;
  onClick: () => void;
  onToggleSave: () => void;
}) {
  return (
    <div className={`flex items-center gap-1 rounded-md transition-colors ${
      isActive
        ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30"
        : "bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--accent)]/50"
    }`}>
      <button
        onClick={onToggleSave}
        className="px-1 py-2 text-[10px] hover:text-[var(--accent)] transition-colors shrink-0"
        title={run.saved ? "Unsave" : "Save"}
      >
        {run.saved ? "★" : "☆"}
      </button>
      <button onClick={onClick} className="flex-1 text-left px-1 py-2 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${
            isActive ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
          }`}>
            {modeIcon(run.mode)}
          </span>
          <span className="text-xs text-[var(--text-primary)] truncate flex-1">
            {run.question || run.table || run.mode}
          </span>
          {run.notes && (
            <span className="text-[10px] text-[var(--text-muted)]" title={run.notes}>📝</span>
          )}
          {run.version > 1 && (
            <span className="text-[10px] text-[var(--text-muted)]">v{run.version}</span>
          )}
          <span className={`text-[10px] ${statusColor(run.status)}`}>●</span>
          <span className="text-[10px] text-[var(--text-muted)]">{formatTime(run.timestamp)}</span>
        </div>
      </button>
    </div>
  );
}

// ── Run Detail ────────────────────────────────────────────────

function RunDetail({ run, onDelete, onExport, onRerun, onDuplicate, onUpdateNotes, onSaveAsTemplate }: {
  run: AnalysisRun;
  onDelete: () => void;
  onExport: () => void;
  onRerun: () => void;
  onDuplicate: () => void;
  onUpdateNotes: (notes: string) => void;
  onSaveAsTemplate: () => void;
}) {
  const { t } = useTranslation();
  const [showNotes, setShowNotes] = useState(!!run.notes);
  const notesTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleNotesChange = useCallback((value: string) => {
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
    notesTimerRef.current = setTimeout(() => onUpdateNotes(value), 500);
  }, [onUpdateNotes]);

  useEffect(() => {
    return () => {
      if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
    };
  }, []);

  return (
    <div className="space-y-3">
      {/* Action bar */}
      <div className="flex items-center gap-1 pb-2 border-b border-[var(--border-default)]">
        <button
          onClick={onRerun}
          className="px-2 py-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded transition-colors"
          title={t("analysis.rerun")}
        >
          {t("analysis.rerun")}
        </button>
        <button
          onClick={onDuplicate}
          className="px-2 py-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded transition-colors"
          title={t("analysis.duplicate")}
        >
          {t("analysis.duplicate")}
        </button>
        <button
          onClick={onExport}
          className="px-2 py-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded transition-colors"
          title={t("analysis.export")}
        >
          {t("analysis.export")}
        </button>
        <button
          onClick={() => setShowNotes(!showNotes)}
          className={`px-2 py-1 text-[10px] rounded transition-colors ${
            showNotes
              ? "bg-[var(--accent)]/10 text-[var(--accent)]"
              : "text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10"
          }`}
          title={t("analysis.notes")}
        >
          {t("analysis.notes")}
        </button>
        {run.status === "success" && (
          <button
            onClick={onSaveAsTemplate}
            className="px-2 py-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded transition-colors"
            title={t("template.save-as")}
          >
            {t("template.save-as")}
          </button>
        )}
        <button
          onClick={onDelete}
          className="px-2 py-1 text-[10px] text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors ml-auto"
          title={t("analysis.delete")}
        >
          {t("analysis.delete")}
        </button>
      </div>

      {/* Notes */}
      {showNotes && (
        <textarea
          className="w-full px-3 py-2 text-xs bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-md text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-[var(--accent)]/50"
          rows={3}
          placeholder={t("analysis.notes-placeholder")}
          defaultValue={run.notes ?? ""}
          onChange={(e) => handleNotesChange(e.target.value)}
        />
      )}

      {/* Sections */}
      {run.sections.map((section, i) => (
        <AnalysisSectionView key={i} section={section} />
      ))}

      {/* Charts */}
      {run.chartSpecs.length > 0 && (
        <div className="pt-2 border-t border-[var(--border-default)] space-y-4">
          {run.chartSpecs.map((spec, i) => (
            <AiChart key={i} spec={spec} />
          ))}
        </div>
      )}

      {/* Multi-step results */}
      {Boolean(run.multiResult?.steps?.length) && run.multiResult?.steps && (
        <StepResults steps={run.multiResult.steps} />
      )}

      {/* Summary */}
      {run.multiResult?.summary && (
        <div className="pt-2 border-t border-[var(--border-default)]">
          <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
            {t("ai.executive-summary")}
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">{run.multiResult.summary}</p>
        </div>
      )}

      {/* Trace */}
      {run.trace && <TraceTimeline trace={run.trace} />}

      {/* Error */}
      {run.error && (
        <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-md">
          <p className="text-xs text-red-300">{run.error}</p>
        </div>
      )}
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────

export function AnalysisWorkspacePanel() {
  const { t } = useTranslation();
  const { runs, activeRunId, setActiveRun, clearHistory, saveRun, unsaveRun, deleteRun, rerunRun, exportRun, duplicateRun, updateRunNotes, recoverInterruptedRuns } = useAnalysisStore();
  const templates = useTemplateStore((s) => s.templates);
  const [showHistory, setShowHistory] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [saveTemplateRunId, setSaveTemplateRunId] = useState<string | null>(null);
  const [showApplyTemplate, setShowApplyTemplate] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  // Recover interrupted runs on mount
  useEffect(() => {
    recoverInterruptedRuns();
  }, [recoverInterruptedRuns]);

  const activeRun = runs.find((r) => r.id === activeRunId) ?? null;
  const recentRuns = [...runs].reverse();
  const savedRuns = recentRuns.filter((r) => r.saved);
  const unsavedRuns = recentRuns.filter((r) => !r.saved);

  const handleExport = (id: string) => {
    const json = exportRun(id);
    if (!json) return;
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis-${id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRerun = (id: string) => {
    const newId = rerunRun(id);
    if (newId) setActiveRun(newId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-default)]">
        <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
          {t("analysis.workspace")}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
              showHistory
                ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t("analysis.history")}
          </button>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
              showTemplates
                ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t("template.apply")} {templates.length > 0 && `(${templates.length})`}
          </button>
          {runs.length > 0 && (
            <button
              onClick={() => setShowReportDialog(true)}
              className="px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              title={t("report.generate")}
            >
              {t("report.generate")}
            </button>
          )}
          {runs.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] hover:text-red-400 transition-colors"
              title="Clear history"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Templates section */}
        {showTemplates && (
          <div className="space-y-1.5 pb-2 border-b border-[var(--border-default)]">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              {t("template.apply")}
            </p>
            {templates.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">{t("template.no-templates")}</p>
            ) : (
              <>
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setShowApplyTemplate(true)}
                    className="w-full text-left px-3 py-2 rounded-md bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--accent)]/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--text-primary)] truncate">{tpl.name}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {t("template.steps-count", { count: tpl.steps.length })}
                      </span>
                    </div>
                    {tpl.description && (
                      <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{tpl.description}</p>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {/* Session history */}
        {showHistory && recentRuns.length > 0 && (
          <div className="space-y-1.5">
            {/* Saved runs */}
            {savedRuns.length > 0 && (
              <>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                  {t("analysis.saved-runs")}
                </p>
                {savedRuns.map((run) => (
                  <HistoryItem
                    key={run.id}
                    run={run}
                    isActive={run.id === activeRunId}
                    onClick={() => setActiveRun(run.id)}
                    onToggleSave={() => unsaveRun(run.id)}
                  />
                ))}
              </>
            )}
            {/* Recent unsaved runs */}
            {unsavedRuns.length > 0 && (
              <>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-2">
                  {t("analysis.recent-runs")}
                </p>
                {unsavedRuns.map((run) => (
                  <HistoryItem
                    key={run.id}
                    run={run}
                    isActive={run.id === activeRunId}
                    onClick={() => setActiveRun(run.id)}
                    onToggleSave={() => saveRun(run.id)}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {/* Active run detail */}
        {activeRun ? (
          <RunDetail
            run={activeRun}
            onDelete={() => deleteRun(activeRun.id)}
            onExport={() => handleExport(activeRun.id)}
            onRerun={() => handleRerun(activeRun.id)}
            onDuplicate={() => {
              const newId = duplicateRun(activeRun.id);
              if (newId) setActiveRun(newId);
            }}
            onUpdateNotes={(notes) => updateRunNotes(activeRun.id, notes)}
            onSaveAsTemplate={() => setSaveTemplateRunId(activeRun.id)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm text-[var(--text-muted)]">{t("analysis.no-selection")}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">{t("analysis.run-hint")}</p>
          </div>
        )}

        {/* Empty state */}
        {runs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm text-[var(--text-muted)]">{t("analysis.no-history")}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">{t("analysis.start-hint")}</p>
          </div>
        )}
      </div>

      {/* Save Template Dialog */}
      {saveTemplateRunId && (() => {
        const run = runs.find((r) => r.id === saveTemplateRunId);
        if (!run) return null;
        return (
          <SaveTemplateDialog
            run={run}
            onClose={() => setSaveTemplateRunId(null)}
          />
        );
      })()}

      {/* Apply Template Dialog */}
      {showApplyTemplate && (
        <ApplyTemplateDialog
          onClose={() => setShowApplyTemplate(false)}
          onApply={(steps, targetTable) => {
            if (steps.length > 0) {
              const id = useAnalysisStore.getState().addRun(steps[0].mode, steps[0].question, targetTable);
              setActiveRun(id);
            }
          }}
        />
      )}

      {/* Report Dialog */}
      {showReportDialog && (
        <ReportDialog onClose={() => setShowReportDialog(false)} />
      )}
    </div>
  );
}
