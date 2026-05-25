"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/layout/sidebar";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/use-language";
import { useThemeStore } from "@/hooks/use-theme";
import type { ReactNode } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/": "nav.home",
  "/data": "nav.data",
  "/query": "nav.query",
  "/analyze": "nav.analyze",
  "/history": "nav.history",
  "/settings": "nav.settings",
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useThemeStore();

  const basePath = "/" + (pathname.split("/")[1] || "");
  const pageTitleKey = PAGE_TITLES[basePath] || PAGE_TITLES["/"];
  const isInvestigation = pathname.startsWith("/analyze");

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Sidebar */}
      <div className="w-52 shrink-0">
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-2.5 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
              {t(pageTitleKey)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="px-2 py-1 text-xs rounded border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? "☼" : "☾"}
            </button>

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 text-xs rounded border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
            >
              {language === "en" ? "中文" : "English"}
            </button>
          </div>
        </header>

        {/* Content: investigation routes manage their own scroll/height */}
        <main className={`flex-1 min-h-0 ${isInvestigation ? "" : "overflow-y-auto"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
