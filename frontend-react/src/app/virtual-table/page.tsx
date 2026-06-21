"use client";
// EXPERIMENTAL: This page is not linked from main navigation.
// It is kept for development/debugging purposes only.

import Link from "next/link";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const VirtualDataTable = dynamic(
  () => import("@/components/VirtualDataTable"),
  { ssr: false }
);

export default function VirtualTablePage() {
  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        {/* Header */}
        <header className="shrink-0 px-6 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center gap-4">
          <h1 className="text-lg font-bold text-[var(--text-primary)]">
            Virtual Table Performance Demo
          </h1>
          <span className="text-xs text-[var(--text-muted)]">
            TanStack Table + TanStack Virtual — 50K rows
          </span>
          <Link
            href="/"
            className="ml-auto text-xs text-[var(--accent)] hover:opacity-80"
          >
            ← Back to Workspace
          </Link>
        </header>

        {/* Virtual Table */}
        <div className="flex-1 min-h-0">
          <VirtualDataTable tableName="large_sales_data" />
        </div>
      </div>
    </ErrorBoundary>
  );
}
