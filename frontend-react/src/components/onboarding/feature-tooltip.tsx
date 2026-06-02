"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Lightbulb, X } from "lucide-react";
import { useOnboardingStore, ONBOARDING_STEPS } from "@/stores/onboarding-store";

interface FeatureTooltipProps {
  stepId: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

export function FeatureTooltip({ stepId, position = "bottom", children }: FeatureTooltipProps) {
  const { t } = useTranslation();
  const { isActive, completedSteps, completeStep } = useOnboardingStore();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const isCompleted = completedSteps.includes(stepId);
  const stepIndex = ONBOARDING_STEPS.findIndex((s) => s.id === stepId);
  const isCurrentStep = useOnboardingStore((s) => s.currentStep === stepIndex);

  useEffect(() => {
    if (isActive && !isCompleted && !dismissed && isCurrentStep) {
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
    setVisible(false);
  }, [isActive, isCompleted, dismissed, isCurrentStep]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
    completeStep(stepId);
  }, [completeStep, stepId]);

  if (!visible || isCompleted) {
    return <>{children}</>;
  }

  const arrowClasses: Record<string, string> = {
    top: "bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-transparent border-r-transparent border-t-[var(--bg-secondary)]",
    bottom: "top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-transparent border-r-transparent border-b-[var(--bg-secondary)]",
    left: "right-0 top-1/2 -translate-y-1/2 translate-x-full border-t-transparent border-b-transparent border-l-[var(--bg-secondary)]",
    right: "left-0 top-1/2 -translate-y-1/2 -translate-x-full border-t-transparent border-b-transparent border-r-[var(--bg-secondary)]",
  };

  const containerClasses: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative inline-block w-full">
      {/* Highlight ring */}
      <div className="ring-2 ring-[var(--accent)]/40 ring-offset-2 ring-offset-[var(--bg-primary)] rounded-lg transition-all">
        {children}
      </div>

      {/* Tooltip popover */}
      <div
        ref={tooltipRef}
        className={`absolute z-50 ${containerClasses[position]} w-64`}
      >
        <div className="bg-[var(--bg-secondary)] border border-[var(--accent)]/30 rounded-lg shadow-lg p-3">
          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-[6px] ${arrowClasses[position]}`}
          />

          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--text-primary)]">
                {t(`onboarding.step.${stepId}.title`)}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                {t(`onboarding.step.${stepId}.tooltip`)}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleDismiss}
            className="mt-2 w-full text-center text-[10px] font-medium text-[var(--accent)] hover:underline"
          >
            {t("onboarding.got-it")}
          </button>
        </div>
      </div>
    </div>
  );
}
