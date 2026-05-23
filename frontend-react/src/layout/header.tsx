"use client";

import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/use-language";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useThemeStore } from "@/hooks/use-theme";

export function Header() {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const { togglePanel, collapsedPanels } = useWorkspaceStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-default)]">
      <div className="flex items-center gap-3">
        <span className="text-xl"> </span>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)] m-0">
            {t("app.title")}
          </h1>
          <p className="text-xs text-[var(--text-muted)] m-0">
            {t("app.subtitle")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Panel toggles */}
        <button
          onClick={() => togglePanel("left")}
          className="px-2 py-1 text-xs rounded border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
          title={collapsedPanels.left ? t("header.show-left") : t("header.hide-left")}
        >
          {collapsedPanels.left ? "◀" : "▶"}
        </button>
        <button
          onClick={() => togglePanel("right")}
          className="px-2 py-1 text-xs rounded border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
          title={collapsedPanels.right ? t("header.show-right") : t("header.hide-right")}
        >
          {collapsedPanels.right ? "▶" : "◀"}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="px-2 py-1 text-xs rounded border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>

        {/* Language toggle */}
        <button
          onClick={toggleLanguage}
          className="px-3 py-1 text-xs rounded border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
        >
          {language === "en" ? "中文" : "English"}
        </button>

        {/* Virtual table demo link */}
        <a
          href="/virtual-table"
          className="px-3 py-1 text-xs rounded border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
        >
          ⚡ Virtual Table
        </a>
      </div>
    </header>
  );
}
