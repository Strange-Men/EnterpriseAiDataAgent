"use client";

import { useTranslation } from "react-i18next";
import { FileUploadPanel } from "@/panels/file-upload-panel";
import { TableManagementPanel } from "@/panels/table-management-panel";
import { DataPreviewPanel } from "@/panels/data-preview-panel";
import { StatusPanel } from "@/panels/status-panel";
import { PageHeader } from "@/components/ui/page-header";
import { CurrentTableCard } from "@/components/current-table-card";

export default function DataPage() {
  const { t } = useTranslation();

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="px-6 pt-5">
        <PageHeader
          title={t("data.title")}
          description={t("data.description")}
        />
      </div>
      <div className="flex-1 min-w-0 flex overflow-hidden">
        {/* Left sidebar: upload + current table + tables + status */}
        <div className="w-72 shrink-0 border-r border-[var(--border-default)] overflow-y-auto p-4 space-y-4">
          <FileUploadPanel />
          <hr className="border-[var(--border-default)]" />
          <CurrentTableCard />
          <hr className="border-[var(--border-default)]" />
          <TableManagementPanel />
          <hr className="border-[var(--border-default)]" />
          <StatusPanel />
        </div>

        {/* Main area: data preview */}
        <div className="flex-1 min-w-0 overflow-y-auto p-4">
          <DataPreviewPanel />
        </div>
      </div>
    </div>
  );
}
