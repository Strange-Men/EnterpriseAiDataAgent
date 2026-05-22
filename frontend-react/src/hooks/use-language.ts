"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useWorkspaceStore } from "@/stores/workspace-store";

/**
 * Syncs the i18next language with the Zustand workspace store.
 */
export function useLanguage() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useWorkspaceStore();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const toggleLanguage = () => {
    const next = language === "en" ? "zh" : "en";
    setLanguage(next);
  };

  return { language, setLanguage, toggleLanguage };
}
