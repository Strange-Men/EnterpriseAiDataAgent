"use client";

import { SqlWorkspacePanel } from "@/panels/sql-workspace-panel";
import { FeatureTooltip } from "@/components/onboarding/feature-tooltip";

export default function QueryPage() {
  return (
    <div className="h-full p-4">
      <FeatureTooltip stepId="run-query" position="bottom">
        <div data-onboarding="sql-editor">
          <SqlWorkspacePanel />
        </div>
      </FeatureTooltip>
    </div>
  );
}
