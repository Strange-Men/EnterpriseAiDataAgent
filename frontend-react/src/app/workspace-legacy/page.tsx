"use client";

import { useEffect, useState } from "react";
import { ClientProviders } from "@/components/client-providers";
import { Header } from "@/layout/header";
import { WorkspaceLayout } from "@/layout/workspace-layout";
import { FileUploadPanel } from "@/panels/file-upload-panel";
import { TableManagementPanel } from "@/panels/table-management-panel";
import { SqlWorkspacePanel } from "@/panels/sql-workspace-panel";
import { DataPreviewPanel } from "@/panels/data-preview-panel";
import { SqlHistoryPanel } from "@/panels/sql-history-panel";
import { AnalysisWorkspacePanel } from "@/panels/analysis-workspace-panel";
import { StatusPanel } from "@/panels/status-panel";
import { TabGroup } from "@/components/ui/tab-group";
import { useTranslation } from "react-i18next";
import { useWorkspaceStore } from "@/stores/workspace-store";

function WorkspaceContent() {
  const { t } = useTranslation();
  const { setPanelCollapsed } = useWorkspaceStore();
  const [isMobile, setIsMobile] = useState(false);

  // Auto-collapse side panels on mobile
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setPanelCollapsed("left", true);
        setPanelCollapsed("right", true);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [setPanelCollapsed]);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 min-h-0">
        <WorkspaceLayout
          left={
            <div className="space-y-6">
              <TableManagementPanel />
              <hr className="border-[var(--border-default)]" />
              <FileUploadPanel />
              <hr className="border-[var(--border-default)]" />
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
                {
                  id: "analysis",
                  label: t("analysis.tab-analysis"),
                  content: <AnalysisWorkspacePanel />,
                },
              ]}
            />
          }
        />
      </main>
    </div>
  );
}

export default function LegacyWorkspacePage() {
  return (
    <ClientProviders>
      <WorkspaceContent />
    </ClientProviders>
  );
}
