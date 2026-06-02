"use client";

import dynamic from "next/dynamic";
import { PanelSkeleton } from "@/components/ui/skeleton";
import { FeatureTooltip } from "@/components/onboarding/feature-tooltip";

const InvestigationWorkspace = dynamic(
  () => import("@/components/investigation/investigation-workspace").then((m) => ({ default: m.InvestigationWorkspace })),
  { loading: () => <PanelSkeleton /> }
);

export default function AnalyzePage() {
  return (
    <FeatureTooltip stepId="ask-ai" position="bottom">
      <div data-onboarding="ai-input">
        <InvestigationWorkspace />
      </div>
    </FeatureTooltip>
  );
}
