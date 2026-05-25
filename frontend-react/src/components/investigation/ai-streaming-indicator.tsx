"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";
import { Lightbulb, Play, FileText, BrainCircuit } from "lucide-react";

interface StreamingIndicatorProps {
  stage: string;
  step?: number;
  totalSteps?: number;
  className?: string;
}

const stageConfig: Record<string, { icon: typeof Lightbulb; labelKey: string }> = {
  plan: { icon: Lightbulb, labelKey: "ai.generating-plan" },
  step: { icon: Play, labelKey: "inv.executing-step" },
  summary: { icon: FileText, labelKey: "inv.streaming" },
  analyzing: { icon: BrainCircuit, labelKey: "ai.analyzing" },
};

export function StreamingIndicator({ stage, step, totalSteps, className }: StreamingIndicatorProps) {
  const { t } = useTranslation();
  const config = stageConfig[stage];

  return (
    <div className={cn("space-y-2", className)}>
      {/* Progress bar */}
      <div className="w-full h-0.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--accent)] rounded-full transition-all duration-500 ease-out"
          style={{
            width: stage === "plan" ? "20%" : stage === "step" ? `${20 + (step ?? 0) * 15}%` : stage === "summary" ? "85%" : "95%",
          }}
        />
      </div>

      {/* Stage indicator */}
      <div className="flex items-center gap-2.5 px-1">
        {config ? (
          <config.icon className="w-3.5 h-3.5 text-[var(--accent)] animate-pulse" />
        ) : (
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" style={{ animationDelay: "0.2s" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        )}

        <span className="text-xs text-[var(--text-muted)]">
          {stage === "step" && step
            ? t("inv.executing-step", { step: totalSteps ? `${step}/${totalSteps}` : step })
            : config
              ? t(config.labelKey)
              : t("ai.analyzing")}
        </span>

        {stage === "summary" && (
          <span className="inline-block w-0.5 h-3.5 bg-[var(--accent)] animate-typing-cursor" />
        )}
      </div>
    </div>
  );
}
