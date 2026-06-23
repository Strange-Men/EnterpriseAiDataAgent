"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Play, Download, Trash2, MoreHorizontal, FileText, ClipboardCopy } from "lucide-react";
import { useAnalysisStore, type AnalysisRun } from "@/stores/analysis-store";
import { downloadBlob } from "@/utils/download";
import { runToMarkdown } from "@/utils/export-markdown";
import { formatLocalDateTime } from "@/utils/datetime";
import { renderSafeText } from "@/utils/safe-render";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

const MODE_LABELS: Record<string, string> = {
  "full-analysis": "inv.mode.full",
  autonomous: "inv.mode.autonomous",
  explain: "inv.mode.explain",
  insights: "inv.mode.insights",
  charts: "inv.mode.charts",
  anomalies: "inv.mode.anomalies",
};

interface RunHeaderProps {
  run: AnalysisRun;
}

export function RunHeader({ run }: RunHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const deleteRun = useAnalysisStore((s) => s.deleteRun);
  const rerunRun = useAnalysisStore((s) => s.rerunRun);
  const exportRun = useAnalysisStore((s) => s.exportRun);

  const handleExportMarkdown = useCallback(() => {
    const md = runToMarkdown(run);
    downloadBlob(`analysis-${run.id.slice(0, 8)}.md`, md, "text/markdown");
    toast.success(t("ai.exported-md"));
  }, [run, t]);

  const handleExportJson = useCallback(() => {
    const json = exportRun(run.id);
    if (json) {
      downloadBlob(`analysis-${run.id.slice(0, 8)}.json`, json, "application/json");
      toast.success(t("ai.exported-json"));
    }
  }, [run.id, exportRun, t]);

  const handleCopySummary = useCallback(async () => {
    const summarySection = run.sections.find(
      (s) => s.title.toLowerCase().includes("summary") || s.title.includes("摘要")
    );
    const text = summarySection?.content || run.question || "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("ai.copied"));
    } catch {
      toast.error(t("ai.copy-failed"));
    }
  }, [run, t]);

  const handleDelete = useCallback(() => {
    deleteRun(run.id);
    toast.success(t("analysis.delete"));
    router.push("/analyze");
  }, [run.id, deleteRun, router, t]);

  const handleRerun = useCallback(() => {
    const newId = rerunRun(run.id);
    if (newId) {
      router.push(`/analyze/${newId}`);
    }
  }, [run.id, rerunRun, router]);

  return (
    <div className="space-y-3">
      {/* Back */}
      <button
        onClick={() => router.push("/analyze")}
        className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
      >
        ← {t("inv.back")}
      </button>

      {/* Title & status */}
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)] uppercase tracking-wider">
              {t(MODE_LABELS[run.mode] || run.mode)}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              run.status === "success" ? "bg-green-500/10 text-green-400" :
              run.status === "error" ? "bg-red-500/10 text-red-400" :
              "bg-yellow-500/10 text-yellow-400"
            }`}>
              {run.status}
            </span>
            {run.version > 1 && (
              <span className="text-xs text-[var(--text-muted)]">v{run.version}</span>
            )}
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mt-1 truncate">
            {renderSafeText(run.question || run.table || run.mode, "Analysis")}
          </h2>
          {run.table && (
            <span className="text-xs text-[var(--text-muted)] font-mono bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded mt-1 inline-block">
              {run.table}
            </span>
          )}
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {formatLocalDateTime(run.timestamp)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="secondary" size="sm" onClick={handleRerun} leftIcon={<Play className="w-3 h-3" />}>
            {t("analysis.rerun")}
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportMarkdown} leftIcon={<FileText className="w-3 h-3" />}>
            {t("analysis.export")}
          </Button>
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm" className="!px-1">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            }
          >
            <DropdownMenuItem onClick={handleCopySummary}>
              <ClipboardCopy className="w-3 h-3" /> {t("analysis.copy-summary")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportJson}>
              <Download className="w-3 h-3" /> {t("analysis.export-raw-json")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} danger>
              <Trash2 className="w-3 h-3" /> {t("analysis.delete")}
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
