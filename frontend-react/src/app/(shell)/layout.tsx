import { ClientProviders } from "@/components/client-providers";
import { AppShell } from "@/layout/app-shell";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import type { ReactNode } from "react";

export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      <ErrorBoundary>
        <AppShell>{children}</AppShell>
      </ErrorBoundary>
    </ClientProviders>
  );
}
