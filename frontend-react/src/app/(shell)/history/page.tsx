"use client";

import { SqlHistoryPanel } from "@/panels/sql-history-panel";

export default function HistoryPage() {
  return (
    <div className="h-full overflow-hidden">
      <SqlHistoryPanel />
    </div>
  );
}
