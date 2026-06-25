/**
 * M4-8.7.1 Settings Page Copy + Visual Polish
 *
 * 确认 Settings 页面文案优化和视觉分组正确集成。
 */

import { describe, it, expect } from "vitest";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

const zhT = zh.translation;
const enT = en.translation;

describe("M4-8.7.1 Settings Page Copy + Visual Polish", () => {
  describe("1. Settings Header", () => {
    it("settings page title exists via nav.settings", () => {
      expect(zhT["nav.settings"]).toBe("设置");
      expect(enT["nav.settings"]).toBe("Settings");
    });

    it("settings description mentions language/appearance/preferences", () => {
      expect(zhT["settings.description"]).toContain("语言");
      expect(zhT["settings.description"]).toContain("外观");
      expect(enT["settings.description"]).toContain("language");
      expect(enT["settings.description"]).toContain("appearance");
    });
  });

  describe("2. Settings Section Grouping", () => {
    it("interface preferences section header exists", () => {
      expect(zhT["settings.section-preferences"]).toBe("界面偏好");
      expect(enT["settings.section-preferences"]).toBe("Interface Preferences");
    });

    it("interface preferences section description exists", () => {
      expect(zhT["settings.section-preferences-desc"]).toBeTruthy();
      expect(enT["settings.section-preferences-desc"]).toBeTruthy();
    });

    it("system information section header exists", () => {
      expect(zhT["settings.section-system"]).toBe("系统信息");
      expect(enT["settings.section-system"]).toBe("System Information");
    });

    it("system information section description exists", () => {
      expect(zhT["settings.section-system-desc"]).toBeTruthy();
      expect(enT["settings.section-system-desc"]).toBeTruthy();
    });
  });

  describe("3. Language Copy i18n Migration", () => {
    it("language name zh is via i18n key", () => {
      expect(zhT["settings.lang-zh"]).toBe("中文");
      expect(enT["settings.lang-zh"]).toBe("Chinese");
    });

    it("language name en is via i18n key", () => {
      expect(zhT["settings.lang-en"]).toBe("英文");
      expect(enT["settings.lang-en"]).toBe("English");
    });

    it("switch-language button text is i18n", () => {
      expect(zhT["settings.switch-language"]).toBe("切换成英文");
      expect(enT["settings.switch-language"]).toBe("Switch to Chinese");
    });
  });

  describe("4. Theme Copy (unchanged, still i18n)", () => {
    it("theme label exists", () => {
      expect(zhT["settings.theme"]).toBe("主题");
      expect(enT["settings.theme"]).toBe("Theme");
    });

    it("dark/light labels exist", () => {
      expect(zhT["settings.dark"]).toBe("深色");
      expect(zhT["settings.light"]).toBe("浅色");
      expect(enT["settings.dark"]).toBe("Dark");
      expect(enT["settings.light"]).toBe("Light");
    });

    it("current label exists", () => {
      expect(zhT["settings.current"]).toBe("当前");
      expect(enT["settings.current"]).toBe("Current");
    });

    it("switch-to label exists", () => {
      expect(zhT["settings.switch-to"]).toBe("切换到");
      expect(enT["settings.switch-to"]).toBe("Switch to");
    });
  });

  describe("5. Brand / Version Fallback", () => {
    it("brand name is i18n key", () => {
      expect(zhT["settings.brand-name"]).toBe("Enterprise AI Data Agent");
      expect(enT["settings.brand-name"]).toBe("Enterprise AI Data Agent");
    });

    it("version fallback exists for missing version", () => {
      expect(zhT["settings.version-fallback"]).toBe("版本信息暂不可用");
      expect(enT["settings.version-fallback"]).toBe("Version information unavailable");
    });

    it("version label exists", () => {
      expect(zhT["settings.version"]).toBe("版本");
      expect(enT["settings.version"]).toBe("Version");
    });
  });

  describe("6. No Hardcoded Language Names in Page", () => {
    it("settings keys are symmetric between zh and en", () => {
      const settingsKeys = Object.keys(zhT).filter((k) => k.startsWith("settings."));
      const enSettingsKeys = Object.keys(enT).filter((k) => k.startsWith("settings."));
      expect(settingsKeys.sort()).toEqual(enSettingsKeys.sort());
    });
  });

  describe("7. Regression Safety", () => {
    it("language toggle handler key preserved", () => {
      // switch-language key must exist for the toggle button
      expect(zhT["settings.switch-language"]).toBeTruthy();
      expect(enT["settings.switch-language"]).toBeTruthy();
    });

    it("theme toggle handler keys preserved", () => {
      // switch-to + dark/light keys must exist for the toggle button
      expect(zhT["settings.switch-to"]).toBeTruthy();
      expect(zhT["settings.dark"]).toBeTruthy();
      expect(zhT["settings.light"]).toBeTruthy();
    });

    it("no new setting items added (no settings.api-*, settings.user-*)", () => {
      const settingsKeys = Object.keys(zhT).filter((k) => k.startsWith("settings."));
      const hasApiKeys = settingsKeys.some((k) => k.includes("api"));
      const hasUserKeys = settingsKeys.some((k) => k.includes("user"));
      expect(hasApiKeys).toBe(false);
      expect(hasUserKeys).toBe(false);
    });

    it("no restored experimental features in settings scope", () => {
      const allKeys = Object.keys(zhT);
      const hasTemplates = allKeys.some((k) => k.includes("template") && k.includes("settings"));
      const hasSchedule = allKeys.some((k) => k.includes("schedule") && k.includes("settings"));
      expect(hasTemplates).toBe(false);
      expect(hasSchedule).toBe(false);
    });
  });
});
