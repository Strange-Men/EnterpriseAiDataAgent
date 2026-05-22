"use client";

import { useTranslation } from "react-i18next";
import { useDataStore } from "@/stores/data-store";
import { TabGroup } from "@/components/ui/tab-group";
import { DataTable } from "@/components/ui/data-table";

export function DataPreviewPanel() {
  const { t } = useTranslation();
  const { currentTable, currentData, currentColumns } = useDataStore();

  if (!currentData || currentData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-[var(--text-muted)]">{t("preview.no-data")}</p>
      </div>
    );
  }

  const tabs = [
    {
      id: "preview",
      label: t("preview.tab-preview"),
      content: <DataTable data={currentData} columns={currentColumns} />,
    },
    {
      id: "schema",
      label: t("preview.tab-schema"),
      content: (
        <div className="text-sm text-[var(--text-muted)]">
          Schema view — connected to backend API for column metadata.
        </div>
      ),
    },
    {
      id: "quality",
      label: t("preview.tab-quality"),
      content: (
        <div className="text-sm text-[var(--text-muted)]">
          Quality analysis — connected to backend data quality engine.
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {currentTable && (
        <div className="text-xs text-[var(--text-muted)] mb-2">
          {t("preview.table")}: <code className="text-[var(--accent)]">{currentTable}</code>
        </div>
      )}
      <div className="flex-1 min-h-0">
        <TabGroup tabs={tabs} />
      </div>
    </div>
  );
}
