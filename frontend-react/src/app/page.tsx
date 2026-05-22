"use client";

import { ClientProviders } from "@/components/client-providers";
import { Header } from "@/layout/header";
import { WorkspaceLayout } from "@/layout/workspace-layout";
import { FileUploadPanel } from "@/panels/file-upload-panel";
import { TableManagementPanel } from "@/panels/table-management-panel";
import { SqlWorkspacePanel } from "@/panels/sql-workspace-panel";
import { DataPreviewPanel } from "@/panels/data-preview-panel";
import { SqlHistoryPanel } from "@/panels/sql-history-panel";
import { StatusPanel } from "@/panels/status-panel";
import { TabGroup } from "@/components/ui/tab-group";
import { useTranslation } from "react-i18next";

function WorkspaceContent() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 min-h-0">
        <WorkspaceLayout
          left={
            <div className="space-y-6">
              <TableManagementPanel />
              <hr className="border-[#30363D]" />
              <FileUploadPanel />
              <hr className="border-[#30363D]" />
              <StatusPanel />
            </div>
          }
          center={<SqlWorkspacePanel />}
          right={
            <TabGroup
              tabs={[
                {
                  id: "preview",
                  label: t("preview.tab-preview"),
                  content: <DataPreviewPanel />,
                },
                {
                  id: "history",
                  label: t("history.title"),
                  content: <SqlHistoryPanel />,
                },
              ]}
            />
          }
        />
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <ClientProviders>
      <WorkspaceContent />
    </ClientProviders>
  );
}
