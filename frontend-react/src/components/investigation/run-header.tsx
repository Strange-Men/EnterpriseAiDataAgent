"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Save, Copy, Play, Download, Trash2, MoreHorizontal } from "lucide-react";
import { useAnalysisStore, type AnalysisRun } from "@/stores/analysis-store";
import { downloadBlob } from "@/utils/download";
import { formatLocalDateTime } from "@/utils/datetime";
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
  const saveRun = useAnalysisStore((s) => s.saveRun);
  const unsaveRun = useAnalysisStore((s) => s.unsaveRun);
  const deleteRun = useAnalysisStore((s) => s.deleteRun);
  const rerunRun = useAnalysisStore((s) => s.rerunRun);
  const exportRun = useAnalysisStore((s) => s.exportRun);
  const duplicateRun = useAnalysisStore((s) => s.duplicateRun);

  const handleSave = useCallback(() => {
    if (run.saved) {
      unsaveRun(run.id);
    } else {
      saveRun(run.id);
      toast.success(t("template.save-as"));
    }
  }, [run.id, run.saved, saveRun, unsaveRun, t]);

  const handleExport = useCallback(() => {
    const json = exportRun(run.id);
    if (json) {
      downloadBlob(`analysis-${run.id.slice(0, 8)}.json`, json, "application/json");
      toast.success(t("ai.exported-json"));
    }
  }, [run.id, exportRun, t]);

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

  const handleDuplicate = useCallback(() => {
    const newId = duplicateRun(run.id);
    if (newId) {
      router.push(`/analyze/${newId}`);
    }
  }, [run.id, duplicateRun, router]);

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
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)] uppercase tracking-wider">
              {t(MODE_LABELS[run.mode] || run.mode)}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              run.status === "success" ? "bg-green-500/10 text-green-400" :
              run.status === "error" ? "bg-red-500/10 text-red-400" :
              "bg-yellow-500/10 text-yellow-400"
            }`}>
              {run.status}
            </span>
            {run.version > 1 && (
              <span className="text-[10px] text-[var(--text-muted)]">v{run.version}</span>
            )}
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mt-1 truncate">
            {run.question || run.table || run.mode}
          </h2>
          {run.table && (
            <span className="text-[10px] text-[var(--text-muted)] font-mono bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded mt-1 inline-block">
              {run.table}
            </span>
          )}
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            {formatLocalDateTime(run.timestamp)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="secondary" size="sm" onClick={handleSave} leftIcon={<Save className="w-3 h-3" />}>
            {run.saved ? t("analysis.unsave") : t("analysis.save")}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleRerun} leftIcon={<Play className="w-3 h-3" />}>
            {t("analysis.rerun")}
          </Button>
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm" className="!px-1">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            }
          >
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="w-3 h-3" /> {t("analysis.duplicate")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExport}>
              <Download className="w-3 h-3" /> {t("analysis.export")}
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
