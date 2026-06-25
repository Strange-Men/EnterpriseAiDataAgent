"use client";

import { useTranslation } from "react-i18next";

interface WorkflowBannerProps {
  stage: string;
  table?: string | null;
  isGeneratingSql: boolean;
  onGenerateSql: () => void;
  onReset: () => void;
}

export function WorkflowBanner({
  stage,
  table,
  isGeneratingSql,
  onGenerateSql,
  onReset,
}: WorkflowBannerProps) {
  const { t } = useTranslation();

  if (stage === "idle") return null;

  if (stage === "done") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 mb-2 bg-green-500/5 border border-green-500/20 rounded-md text-xs">
        <span className="text-green-400">{t("workflow.done", { table })}</span>
        <button
          onClick={onReset}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] ml-auto"
        >
          x
        </button>
      </div>
    );
  }

  const label = stage === "uploading" ? t("workflow.uploading") :
    stage === "profiling" ? t("workflow.table-ready", { table }) :
    stage === "analyzing" ? t("workflow.analyzing", { table }) :
    stage === "sql-ready" ? t("workflow.analysis-complete", { table }) :
    stage === "executing" ? t("workflow.executing") : "";

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 mb-2 bg-purple-500/5 border border-purple-500/20 rounded-md text-xs">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
      <span className="text-purple-400 font-medium">{label}</span>
      {stage === "sql-ready" && table && (
        <button
          onClick={onGenerateSql}
          disabled={isGeneratingSql}
          className="ml-auto px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded hover:bg-purple-500/20 transition-colors disabled:opacity-50"
        >
          {isGeneratingSql ? t("workflow.generating") : t("workflow.generate-sql")}
        </button>
      )}
      <button
        onClick={onReset}
        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] ml-1"
        title={t("workflow.dismiss")}
      >
        x
      </button>
    </div>
  );
}
