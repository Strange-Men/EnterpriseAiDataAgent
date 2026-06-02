"use client";

import { SqlWorkspacePanel } from "@/panels/sql-workspace-panel";
import { FeatureTooltip } from "@/components/onboarding/feature-tooltip";

export default function QueryPage() {
  return (
    <div className="flex flex-col h-full p-4">
      <FeatureTooltip stepId="run-query" position="bottom">
        <div data-onboarding="sql-editor" className="flex flex-col flex-1 min-h-0">
          <SqlWorkspacePanel />
        </div>
      </FeatureTooltip>
    </div>
  );
}
