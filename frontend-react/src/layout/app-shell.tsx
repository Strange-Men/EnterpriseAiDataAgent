"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/layout/sidebar";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/use-language";
import { useThemeStore } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { useSystemStatus } from "@/hooks/use-system-status";
import { useInvestigationStore } from "@/stores/investigation-store";
import { useDataStore } from "@/stores/data-store";
import {
  Sun, Moon, Languages, Menu, X, Database,
} from "lucide-react";
import type { ReactNode } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/": "nav.home",
  "/data": "nav.data",
  "/query": "nav.query",
  "/analyze": "nav.analyze",  // 分析工作台
  "/history": "nav.history",
  "/settings": "nav.settings",
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useThemeStore();

  // Initialize system status + tables on mount (single source of polling)
  useSystemStatus();

  // Current table status for header
  const activeTable = useInvestigationStore((s) => s.activeTable);
  const tables = useDataStore((s) => s.tables);
  const currentTable = tables.find((tbl) => tbl.name === activeTable);

  const basePath = "/" + (pathname.split("/")[1] || "");
  const pageTitleKey = PAGE_TITLES[basePath] || PAGE_TITLES["/"];
  const isInvestigation = pathname.startsWith("/analyze");

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Sidebar */}
      <div className="w-52 shrink-0 max-md:hidden">
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-2.5 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileNavOpen(true)}
              title={t("header.open-nav")}
              aria-label={t("header.open-nav")}
              className="md:hidden"
              leftIcon={<Menu className="w-3.5 h-3.5" />}
            />
            <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
              {t(pageTitleKey)}
            </span>
            {/* Quick breadcrumb hint */}
            {isInvestigation && pathname !== "/analyze" && (
              <span className="text-xs text-[var(--text-muted)]">
                / {pathname.split("/").pop()?.slice(0, 8)}...
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Current table status */}
            <div className="hidden sm:flex items-center gap-1.5 mr-2 px-2.5 py-1 rounded-md bg-[var(--bg-tertiary)] text-xs">
              <Database className="w-3 h-3 text-[var(--text-muted)]" />
              {activeTable ? (
                <span className="text-[var(--text-muted)]">
                  <span className="text-[var(--text-primary)] font-medium">{activeTable}</span>
                  {currentTable && (
                    <span className="ml-1">({t("header.rows-count", { count: currentTable.rowCount })})</span>
                  )}
                </span>
              ) : (
                <span className="text-[var(--text-muted)]">{t("header.no-table")}</span>
              )}
            </div>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              title={theme === "dark" ? t("header.switch-to-light") : t("header.switch-to-dark")}
              leftIcon={theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            />

            {/* Language toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              leftIcon={<Languages className="w-3.5 h-3.5" />}
            >
              {language === "en" ? "中文" : "English"}
            </Button>
          </div>
        </header>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
            <button
              type="button"
              aria-label={t("header.close-nav")}
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative z-10 h-full w-64 max-w-[85vw] bg-[var(--bg-secondary)] shadow-xl">
              <div className="absolute right-2 top-2 z-20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileNavOpen(false)}
                  title={t("header.close-nav")}
                  aria-label={t("header.close-nav")}
                  leftIcon={<X className="w-3.5 h-3.5" />}
                />
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Content: investigation routes manage their own scroll/height */}
        <main className={`flex-1 min-h-0 ${isInvestigation ? "" : "overflow-y-auto"}`}>
          {children}
        </main>
      </div>

    </div>
  );
}
