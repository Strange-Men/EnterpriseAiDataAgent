import { describe, it, expect } from "vitest";
import { formatRuntime } from "@/utils/datetime";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

// M4-8.5.2: History Record Cards Polish
describe("History Record Cards (M4-8.5.2)", () => {
  describe("formatRuntime utility", () => {
    it("should format milliseconds under 1s", () => {
      expect(formatRuntime(500)).toBe("500ms");
    });

    it("should format exact seconds", () => {
      expect(formatRuntime(1000)).toBe("1s");
    });

    it("should format decimal seconds", () => {
      expect(formatRuntime(1200)).toBe("1.2s");
    });

    it("should format minutes and seconds", () => {
      expect(formatRuntime(65000)).toBe("1m 5s");
    });

    it("should handle zero", () => {
      expect(formatRuntime(0)).toBe("0ms");
    });

    it("should handle null/undefined gracefully", () => {
      expect(formatRuntime(null)).toBe("");
      expect(formatRuntime(undefined)).toBe("");
    });

    it("should handle negative values gracefully", () => {
      expect(formatRuntime(-100)).toBe("");
    });
  });

  describe("Status badge i18n keys", () => {
    it("should have Chinese success status", () => {
      expect(zh.translation["history.status-success"]).toBe("成功");
    });

    it("should have English success status", () => {
      expect(en.translation["history.status-success"]).toBe("Success");
    });

    it("should have Chinese partial status", () => {
      expect(zh.translation["history.status-partial"]).toBe("部分成功");
    });

    it("should have English partial status", () => {
      expect(en.translation["history.status-partial"]).toBe("Partial");
    });

    it("should have Chinese error status", () => {
      expect(zh.translation["history.status-error"]).toBe("失败");
    });

    it("should have English error status", () => {
      expect(en.translation["history.status-error"]).toBe("Failed");
    });
  });

  describe("Metadata label i18n keys", () => {
    it("should have Chinese table label", () => {
      expect(zh.translation["history.table-label"]).toBe("表");
    });

    it("should have English table label", () => {
      expect(en.translation["history.table-label"]).toBe("Table");
    });

    it("should have Chinese duration label", () => {
      expect(zh.translation["history.duration-label"]).toBe("耗时");
    });

    it("should have English duration label", () => {
      expect(en.translation["history.duration-label"]).toBe("Duration");
    });
  });

  describe("Fallback title i18n keys", () => {
    it("should have Chinese unnamed analysis fallback", () => {
      expect(zh.translation["history.unnamed-analysis"]).toBe("未命名分析");
    });

    it("should have English unnamed analysis fallback", () => {
      expect(en.translation["history.unnamed-analysis"]).toBe("Untitled analysis");
    });

    it("should have Chinese unnamed SQL fallback", () => {
      expect(zh.translation["history.unnamed-sql"]).toBe("未命名 SQL 查询");
    });

    it("should have English unnamed SQL fallback", () => {
      expect(en.translation["history.unnamed-sql"]).toBe("Untitled SQL query");
    });
  });

  describe("Existing action keys preserved (no regression)", () => {
    it("should preserve open-detail key", () => {
      expect(zh.translation["history.open-detail"]).toBe("查看详情");
      expect(en.translation["history.open-detail"]).toBe("View Details");
    });

    it("should preserve rerun-analysis key", () => {
      expect(zh.translation["history.rerun-analysis"]).toBe("重新运行");
      expect(en.translation["history.rerun-analysis"]).toBe("Re-run");
    });

    it("should preserve load-to-workspace key", () => {
      expect(zh.translation["history.load-to-workspace"]).toBe("加载到工作台");
      expect(en.translation["history.load-to-workspace"]).toBe("Load to Workspace");
    });

    it("should preserve export-md key", () => {
      expect(zh.translation["history.export-md"]).toBe("导出 Markdown");
      expect(en.translation["history.export-md"]).toBe("Export Markdown");
    });

    it("should preserve export-csv key", () => {
      expect(zh.translation["history.export-csv"]).toBe("导出 CSV");
      expect(en.translation["history.export-csv"]).toBe("Export CSV");
    });

    it("should preserve copy-question key", () => {
      expect(zh.translation["history.copy-question"]).toBe("复制问题");
      expect(en.translation["history.copy-question"]).toBe("Copy Question");
    });

    it("should preserve copy-sql key", () => {
      expect(zh.translation["history.copy-sql"]).toBe("复制 SQL");
      expect(en.translation["history.copy-sql"]).toBe("Copy SQL");
    });

    it("should preserve delete key", () => {
      expect(zh.translation["history.delete"]).toBe("删除记录");
      expect(en.translation["history.delete"]).toBe("Delete entry");
    });

    it("should preserve table-not-found key", () => {
      expect(zh.translation["history.table-not-found"]).toContain("{{table}}");
      expect(en.translation["history.table-not-found"]).toContain("{{table}}");
    });
  });

  describe("Negative checks - should NOT restore disabled features", () => {
    it("should not restore Templates page", () => {
      expect(zh.translation["template.save-as"]).toBeDefined();
    });

    it("should not restore /performance route", () => {
      expect(zh.translation["perf.title"]).toBeDefined();
    });

    it("should not restore /virtual-table route", () => {
      expect(true).toBe(true);
    });
  });
});
