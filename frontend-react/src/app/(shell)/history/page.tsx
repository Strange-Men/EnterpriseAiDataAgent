"use client";

import { useTranslation } from "react-i18next";
import { SqlHistoryPanel } from "@/panels/sql-history-panel";
import { PageHeader } from "@/components/ui/page-header";

export default function HistoryPage() {
  const { t } = useTranslation();

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="px-6 pt-5">
        <PageHeader
          title={t("history.title")}
          description={t("history.description")}
        />
      </div>
      <div className="flex-1 overflow-hidden px-6 pb-4">
        <SqlHistoryPanel />
      </div>
    </div>
  );
}
