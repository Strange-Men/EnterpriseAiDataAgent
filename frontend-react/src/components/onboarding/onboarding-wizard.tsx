"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, ArrowRight, RotateCcw, X } from "lucide-react";
import { useOnboardingStore, ONBOARDING_STEPS } from "@/stores/onboarding-store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function OnboardingWizard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isActive, currentStep, completedSteps, completeStep, skipTour, resetTour, setCurrentStep } =
    useOnboardingStore();

  if (!isActive) {
    return (
      <button
        onClick={resetTour}
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors shadow-sm"
        title={t("onboarding.restart")}
      >
        <RotateCcw className="w-3 h-3" />
        {t("onboarding.restart")}
      </button>
    );
  }

  const step = ONBOARDING_STEPS[currentStep];
  const isStepCompleted = (stepId: string) => completedSteps.includes(stepId);
  const allDone = completedSteps.length >= ONBOARDING_STEPS.length;

  return (
    <Card className="fixed top-4 right-4 z-50 w-72 shadow-lg border-[var(--accent)]/30">
      <CardHeader className="flex flex-row items-center justify-between !py-2">
        <CardTitle className="text-[10px]">{t("onboarding.title")}</CardTitle>
        <button
          onClick={skipTour}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          title={t("onboarding.skip")}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </CardHeader>
      <CardContent className="!py-3 space-y-3">
        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {ONBOARDING_STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(i)}
              className={`w-6 h-1.5 rounded-full transition-colors ${
                isStepCompleted(s.id)
                  ? "bg-green-400"
                  : i === currentStep
                    ? "bg-[var(--accent)]"
                    : "bg-[var(--bg-tertiary)]"
              }`}
              title={t(`onboarding.step.${s.id}.title`)}
            />
          ))}
        </div>

        {allDone ? (
          <div className="text-center py-2">
            <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-[var(--text-primary)]">{t("onboarding.complete")}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">{t("onboarding.complete-hint")}</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={skipTour}>
              {t("onboarding.dismiss")}
            </Button>
          </div>
        ) : (
          <>
            {/* Current step */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isStepCompleted(step.id) ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-[var(--accent)] shrink-0" />
                )}
                <p className="text-xs font-medium text-[var(--text-primary)]">
                  {t(`onboarding.step.${step.id}.title`)}
                </p>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] pl-6">
                {t(`onboarding.step.${step.id}.description`)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  router.push(step.route);
                }}
                rightIcon={<ArrowRight className="w-3 h-3" />}
              >
                {t("onboarding.goto")}
              </Button>
              {isStepCompleted(step.id) && (
                <Button variant="ghost" size="sm" onClick={() => completeStep(step.id)}>
                  {t("onboarding.next")}
                </Button>
              )}
            </div>

            {/* Step list */}
            <div className="space-y-1 pt-1 border-t border-[var(--border-default)]">
              {ONBOARDING_STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-2 text-[10px] cursor-pointer py-0.5 ${
                    i === currentStep ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                  }`}
                  onClick={() => setCurrentStep(i)}
                >
                  {isStepCompleted(s.id) ? (
                    <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                  ) : (
                    <Circle className="w-3 h-3 shrink-0" />
                  )}
                  <span className={i === currentStep ? "font-medium" : ""}>
                    {t(`onboarding.step.${s.id}.title`)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
