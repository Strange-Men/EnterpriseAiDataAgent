"use client";

import "@/i18n";
import { useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeSync>
          {children}
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
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
