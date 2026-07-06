"use client";

import { useSystemStatus } from "@/hooks/use-system-status";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  // Keep the single polling source, but do not render the old sidebar/navigation shell.
  useSystemStatus();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <main className="min-h-screen">{children}</main>
    </div>
  );
}
