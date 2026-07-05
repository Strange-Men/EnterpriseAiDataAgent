"use client";

import "@/i18n";
import { Suspense, useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Theme as AstryxTheme } from "@astryxdesign/core/theme";
import { LinkProvider as AstryxLinkProvider } from "@astryxdesign/core/Link";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ui/error-fallback";
import { PanelSkeleton } from "@/components/ui/skeleton";
import { useThemeStore, applyTheme } from "@/hooks/use-theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function ThemeSync({ children }: { children: ReactNode }) {
  const { theme } = useThemeStore();
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
  return <>{children}</>;
}

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <AstryxTheme theme={neutralTheme}>
          <AstryxLinkProvider
            component={({ href, children: linkChildren, ...props }) => (
              <Link href={href} {...props}>
                {linkChildren}
              </Link>
            )}
          >
            <ThemeSync>
              <Suspense fallback={<PanelSkeleton />}>
                {children}
              </Suspense>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-default)",
                    fontSize: "0.8rem",
                    borderRadius: "8px",
                  },
                  success: {
                    iconTheme: { primary: "var(--success)", secondary: "#fff" },
                  },
                  error: {
                    iconTheme: { primary: "var(--error)", secondary: "#fff" },
                    duration: 5000,
                  },
                }}
              />
            </ThemeSync>
          </AstryxLinkProvider>
        </AstryxTheme>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
