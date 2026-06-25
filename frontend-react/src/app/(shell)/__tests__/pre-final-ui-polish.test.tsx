import { describe, it, expect } from "vitest";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

describe("M4-8.8 Pre-final UI Polish", () => {
  // ── Problem 1: Home page entry dedup ──────────────────────────────

  describe("Home page — single entry row (no duplicate cards)", () => {
    it("should still have Chinese upload-data CTA", () => {
      expect(zh.translation["home.upload-data"]).toBe("上传数据");
    });

    it("should still have English upload-data CTA", () => {
      expect(en.translation["home.upload-data"]).toBe("Upload Data");
    });

    it("should still have Chinese start-analysis CTA", () => {
      expect(zh.translation["home.start-analysis"]).toBe("开始分析");
    });

    it("should still have English start-analysis CTA", () => {
      expect(en.translation["home.start-analysis"]).toBe("Start Analysis");
    });

    // Card i18n keys still exist (not deleted from locale) but are not rendered
    it("should retain card i18n keys for backward compatibility", () => {
      expect(zh.translation["home.card-upload-title"]).toBeDefined();
      expect(zh.translation["home.card-nl-title"]).toBeDefined();
      expect(zh.translation["home.card-sql-title"]).toBeDefined();
    });
  });

  // ── Problem 2: query_history table description & delete protection ──

  describe("query_history system table badge and description", () => {
    it("should have Chinese system history badge", () => {
      expect(zh.translation["table.system-history-badge"]).toBe("历史记录表");
    });

    it("should have English system history badge", () => {
      expect(en.translation["table.system-history-badge"]).toBe("History Table");
    });

    it("should have Chinese system history description mentioning query and analysis history", () => {
      const desc = zh.translation["table.system-history-desc"] as string;
      expect(desc).toContain("查询和分析历史");
      expect(desc).toContain("不是普通上传数据表");
    });

    it("should have English system history description mentioning query and analysis history", () => {
      const desc = en.translation["table.system-history-desc"] as string;
      expect(desc).toContain("query and analysis history");
      expect(desc).toContain("not a regular uploaded data table");
    });

    it("should have Chinese delete warning for system table", () => {
      const warning = zh.translation["table.system-table-delete-warning"] as string;
      expect(warning).toContain("系统历史记录表");
      expect(warning).toContain("确定要删除吗");
    });

    it("should have English delete warning for system table", () => {
      const warning = en.translation["table.system-table-delete-warning"] as string;
      expect(warning).toContain("system history table");
      expect(warning).toContain("Are you sure");
    });

    it("should have Chinese system table delete title", () => {
      expect(zh.translation["table.system-table-delete-title"]).toBe("系统表不建议删除");
    });

    it("should have English system table delete title", () => {
      expect(en.translation["table.system-table-delete-title"]).toBe("System table — deletion not recommended");
    });
  });

  // ── Problem 3: Analysis workspace empty state ─────────────────────

  describe("Analysis workspace empty state copy", () => {
    it("should have Chinese empty state hint", () => {
      const hint = zh.translation["inv.start-hint"] as string;
      expect(hint).toContain("点击生成分析后");
      expect(hint).toContain("本次分析结果");
    });

    it("should have English empty state hint", () => {
      const hint = en.translation["inv.start-hint"] as string;
      expect(hint).toContain("current run");
      expect(hint).toContain("Results");
    });
  });

  // ── Negative checks ───────────────────────────────────────────────

  describe("Negative checks — unchanged areas", () => {
    it("should not modify history page keys", () => {
      expect(zh.translation["history.title"]).toBe("历史记录");
      expect(en.translation["history.title"]).toBe("History");
    });

    it("should not modify analysis detail keys", () => {
      expect(zh.translation["analysis.workspace"]).toBeDefined();
      expect(en.translation["analysis.workspace"]).toBeDefined();
    });

    it("should not modify table delete keys for normal tables", () => {
      expect(zh.translation["table.confirm-delete"]).toBeDefined();
      expect(zh.translation["table.delete-success"]).toBeDefined();
      expect(en.translation["table.confirm-delete"]).toBeDefined();
      expect(en.translation["table.delete-success"]).toBeDefined();
    });

    it("should not modify AI API related keys", () => {
      expect(zh.translation["workspace.generate-sql-analyze"]).toBeDefined();
      expect(en.translation["workspace.generate-sql-analyze"]).toBeDefined();
    });
  });
});
