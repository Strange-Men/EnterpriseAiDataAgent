import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OnboardingStep {
  id: string;
  route: string;
  targetSelector?: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: "upload-data", route: "/data", targetSelector: "[data-onboarding='upload']" },
  { id: "run-query", route: "/query", targetSelector: "[data-onboarding='sql-editor']" },
  { id: "check-quality", route: "/data", targetSelector: "[data-onboarding='quality']" },
  { id: "ask-ai", route: "/analyze", targetSelector: "[data-onboarding='ai-input']" },
  { id: "view-analysis", route: "/analyze", targetSelector: "[data-onboarding='analysis-result']" },
];

interface OnboardingState {
  completedSteps: string[];
  isActive: boolean;
  currentStep: number;
  completeStep: (stepId: string) => void;
  nextStep: () => void;
  skipTour: () => void;
  resetTour: () => void;
  setCurrentStep: (step: number) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      completedSteps: [],
      isActive: true,
      currentStep: 0,

      completeStep: (stepId: string) => {
        const { completedSteps } = get();
        if (completedSteps.includes(stepId)) return;
        const newSteps = [...completedSteps, stepId];
        set({
          completedSteps: newSteps,
          currentStep: Math.min(get().currentStep + 1, ONBOARDING_STEPS.length - 1),
          isActive: newSteps.length < ONBOARDING_STEPS.length,
        });
      },

      nextStep: () => {
        const { currentStep } = get();
        set({ currentStep: Math.min(currentStep + 1, ONBOARDING_STEPS.length - 1) });
      },

      skipTour: () => {
        set({ isActive: false });
      },

      resetTour: () => {
        set({ completedSteps: [], isActive: true, currentStep: 0 });
      },

      setCurrentStep: (step: number) => {
        set({ currentStep: Math.max(0, Math.min(step, ONBOARDING_STEPS.length - 1)) });
      },
    }),
    {
      name: "onboarding-progress",
    }
  )
);
