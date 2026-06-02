"use client";

import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/layout/sidebar";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/use-language";
import { useThemeStore } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/ui/command-palette";
import { GlobalSearch } from "@/components/ui/global-search";
import { KeyboardShortcutsModal } from "@/components/ui/keyboard-shortcuts-modal";
import { useKeyboardShortcuts, type Shortcut, formatShortcutKey } from "@/hooks/use-keyboard-shortcuts";
import { useDataStore } from "@/stores/data-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { useSystemStatus } from "@/hooks/use-system-status";
import {
  Sun, Moon, Languages, Search, Keyboard,
} from "lucide-react";
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
  const router = useRouter();
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useThemeStore();
  const tables = useDataStore((s) => s.tables);

  // Initialize system status + tables on mount (single source of polling)
  useSystemStatus();

  const basePath = "/" + (pathname.split("/")[1] || "");
  const pageTitleKey = PAGE_TITLES[basePath] || PAGE_TITLES["/"];
  const isInvestigation = pathname.startsWith("/analyze");

  // Onboarding state
  const onboardingActive = useOnboardingStore((s) => s.isActive);

  // Command palette & global search state
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Build shortcuts list
  const shortcutsList: (Shortcut & { id: string })[] = useMemo(
    () => [
      { id: "command-palette", key: "k", mod: "ctrl", description: "Open command palette", handler: () => setCommandOpen(true), global: true },
      { id: "global-search", key: "f", mod: "ctrl+shift", description: "Global search", handler: () => setSearchOpen(true), global: true },
      { id: "open-shortcuts", key: "?", mod: "ctrl+shift", description: "Keyboard shortcuts help", handler: () => setShortcutsOpen(true), global: true },
      { id: "go-home", key: "h", mod: "ctrl", description: "Go Home", handler: () => router.push("/") },
      { id: "go-analyze", key: "a", mod: "ctrl+shift", description: "Go to Analyze", handler: () => router.push("/analyze") },
      { id: "go-data", key: "d", mod: "ctrl+shift", description: "Go to Data", handler: () => router.push("/data") },
      { id: "go-query", key: "q", mod: "ctrl", description: "Go to Query", handler: () => router.push("/query") },
      { id: "go-settings", key: ",", mod: "ctrl", description: "Go to Settings", handler: () => router.push("/settings") },
      { id: "toggle-theme", key: "t", mod: "ctrl+shift", description: "Toggle theme", handler: toggleTheme, global: true },
      { id: "toggle-language", key: "l", mod: "ctrl+shift", description: "Toggle language", handler: toggleLanguage, global: true },
    ],
    [router, toggleTheme, toggleLanguage]
  );

  useKeyboardShortcuts(shortcutsList);

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
            <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
              {t(pageTitleKey)}
            </span>
            {/* Quick breadcrumb hint */}
            {isInvestigation && pathname !== "/analyze" && (
              <span className="text-[10px] text-[var(--text-muted)]">
                / {pathname.split("/").pop()?.slice(0, 8)}...
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Command palette trigger */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCommandOpen(true)}
              title={`Command palette (${formatShortcutKey({ key: "K", mod: "ctrl" })})`}
              leftIcon={<Search className="w-3.5 h-3.5" />}
            >
              <span className="text-[10px] text-[var(--text-muted)]">{formatShortcutKey({ key: "K", mod: "ctrl" })}</span>
            </Button>

            {/* Keyboard shortcuts help */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShortcutsOpen(true)}
              title="Keyboard shortcuts"
              leftIcon={<Keyboard className="w-3.5 h-3.5" />}
            />

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              title={`${theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} (${formatShortcutKey({ key: "T", mod: "ctrl+shift" })})`}
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

        {/* Content: investigation routes manage their own scroll/height */}
        <main className={`flex-1 min-h-0 ${isInvestigation ? "" : "overflow-y-auto"}`}>
          {children}
        </main>
      </div>

      {/* Onboarding Wizard — fixed position, global across all pages */}
      {onboardingActive && <OnboardingWizard />}

      {/* Overlays */}
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} tables={tables} />
      <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} shortcuts={shortcutsList} />
    </div>
  );
}
