"use client";

import { ClientProviders } from "@/components/client-providers";
import { Header } from "@/layout/header";
import { WorkspaceLayout } from "@/layout/workspace-layout";
import { FileUploadPanel } from "@/panels/file-upload-panel";
import { ChatPanel } from "@/panels/chat-panel";
import { DataPreviewPanel } from "@/panels/data-preview-panel";
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
              <FileUploadPanel />
              <hr className="border-[#30363D]" />
              <StatusPanel />
            </div>
          }
          center={<ChatPanel />}
          right={
            <TabGroup
              tabs={[
                {
                  id: "preview",
                  label: t("preview.tab-preview"),
                  content: <DataPreviewPanel />,
                },
                {
                  id: "charts",
                  label: t("charts.title"),
                  content: (
                    <div className="flex items-center justify-center h-64 text-sm text-[#8B949E]">
                      {t("charts.empty")}
                    </div>
                  ),
                },
                {
                  id: "logs",
                  label: t("logs.title"),
                  content: (
                    <div className="text-sm text-[#8B949E] p-4">
                      {t("logs.empty")}
                    </div>
                  ),
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
