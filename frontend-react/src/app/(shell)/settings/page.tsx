"use client";

import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/use-language";
import { useThemeStore } from "@/hooks/use-theme";
import { useDataStore } from "@/stores/data-store";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Languages, Sun, Moon, Monitor } from "lucide-react";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useThemeStore();
  const version = useDataStore((s) => s.systemStatus.version);

  const themeLabel = theme === "dark" ? t("settings.dark") : t("settings.light");
  const nextThemeLabel = theme === "dark" ? t("settings.light") : t("settings.dark");

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">{t("nav.settings")}</h2>

      <div className="space-y-4">
        {/* Language */}
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Languages className="w-5 h-5 text-[var(--text-muted)]" />
              <div>
                <CardTitle className="!text-sm !normal-case !text-[var(--text-primary)] !tracking-normal !font-medium">{t("app.language")}</CardTitle>
                <p className="text-2xs text-[var(--text-muted)]">{t("settings.current")}: {language === "zh" ? "中文" : "English"}</p>
              </div>
            </div>
            <Button variant="secondary" size="md" onClick={toggleLanguage}>
              {t("settings.switch-to")} {language === "zh" ? "English" : "中文"}
            </Button>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="w-5 h-5 text-[var(--text-muted)]" /> : <Sun className="w-5 h-5 text-[var(--text-muted)]" />}
              <div>
                <CardTitle className="!text-sm !normal-case !text-[var(--text-primary)] !tracking-normal !font-medium">{t("settings.theme")}</CardTitle>
                <p className="text-2xs text-[var(--text-muted)]">{t("settings.current")}: {themeLabel}</p>
              </div>
            </div>
            <Button variant="secondary" size="md" onClick={toggleTheme}>
              {t("settings.switch-to")} {nextThemeLabel}
            </Button>
          </CardContent>
        </Card>

        {/* Version Info */}
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-[var(--text-muted)]" />
              <div>
                <CardTitle className="!text-sm !normal-case !text-[var(--text-primary)] !tracking-normal !font-medium">{t("settings.version")}</CardTitle>
                <p className="text-2xs text-[var(--text-muted)]">Enterprise AI Data Agent v{version}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
