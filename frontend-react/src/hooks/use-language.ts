"use client";

import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useWorkspaceStore } from "@/stores/workspace-store";

/**
 * Syncs the i18next language with the Zustand workspace store.
 */
export function useLanguage() {
  const { i18n } = useTranslation();
  const language = useWorkspaceStore((s) => s.language);
  const setLanguage = useWorkspaceStore((s) => s.setLanguage);

  useEffect(() => {
    if (i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
  }, [i18n, language]);

  const toggleLanguage = useCallback(() => {
    const next = language === "zh" ? "en" : "zh";
    setLanguage(next);
    i18n.changeLanguage(next);
  }, [language, setLanguage, i18n]);

  return { language, toggleLanguage };
}
