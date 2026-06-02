"use client";

import { FileUploadPanel } from "@/panels/file-upload-panel";
import { TableManagementPanel } from "@/panels/table-management-panel";
import { DataPreviewPanel } from "@/panels/data-preview-panel";
import { StatusPanel } from "@/panels/status-panel";
import { FeatureTooltip } from "@/components/onboarding/feature-tooltip";

export default function DataPage() {
  return (
    <div className="flex h-full">
      {/* Left sidebar: upload + tables + status */}
      <div className="w-72 shrink-0 border-r border-[var(--border-default)] overflow-y-auto p-4 space-y-6">
        <FeatureTooltip stepId="upload-data" position="right">
          <div data-onboarding="upload">
            <FileUploadPanel />
          </div>
        </FeatureTooltip>
        <hr className="border-[var(--border-default)]" />
        <TableManagementPanel />
        <hr className="border-[var(--border-default)]" />
        <StatusPanel />
      </div>

      {/* Main area: data preview */}
      <div className="flex-1 min-w-0 overflow-y-auto p-4">
        <FeatureTooltip stepId="check-quality" position="left">
          <div data-onboarding="quality">
            <DataPreviewPanel />
          </div>
        </FeatureTooltip>
      </div>
    </div>
  );
}
