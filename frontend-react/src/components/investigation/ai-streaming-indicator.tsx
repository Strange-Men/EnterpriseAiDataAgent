"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";

interface StreamingIndicatorProps {
  stage: string;
  step?: number;
  className?: string;
}

export function StreamingIndicator({ stage, step, className }: StreamingIndicatorProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("flex items-center gap-2 px-3 py-2", className)}>
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" style={{ animationDelay: "0.2s" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" style={{ animationDelay: "0.4s" }} />
      </div>
      <span className="text-xs text-[var(--text-muted)]">
        {stage === "plan" && t("ai.generating-plan")}
        {stage === "step" && t("inv.executing-step", { step: step ?? "?" })}
        {stage === "summary" && t("inv.streaming")}
        {stage === "analyzing" && t("ai.analyzing")}
      </span>
    </div>
  );
}
