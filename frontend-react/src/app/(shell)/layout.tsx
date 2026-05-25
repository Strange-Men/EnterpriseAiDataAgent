import { ClientProviders } from "@/components/client-providers";
import { AppShell } from "@/layout/app-shell";
import type { ReactNode } from "react";

export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      <AppShell>{children}</AppShell>
    </ClientProviders>
  );
}
