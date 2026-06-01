"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const VirtualDataTable = dynamic(
  () => import("@/components/VirtualDataTable"),
  { ssr: false }
);

export default function VirtualTablePage() {
  return (
    <div className="h-screen flex flex-col bg-[#0E1117]">
      {/* Header */}
      <header className="shrink-0 px-6 py-3 bg-zinc-900 border-b border-zinc-700 flex items-center gap-4">
        <h1 className="text-lg font-bold text-zinc-100">
          Virtual Table Performance Demo
        </h1>
        <span className="text-xs text-zinc-500">
          TanStack Table + TanStack Virtual — 50K rows
        </span>
        <Link
          href="/"
          className="ml-auto text-xs text-blue-400 hover:text-blue-300"
        >
          ← Back to Workspace
        </Link>
      </header>

      {/* Virtual Table */}
      <div className="flex-1 min-h-0">
        <VirtualDataTable tableName="large_sales_data" />
      </div>
    </div>
  );
}
