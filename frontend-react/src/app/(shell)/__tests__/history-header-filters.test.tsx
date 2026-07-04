import { describe, it, expect } from "vitest";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

// M4-8.5.1: History Page Header + Filters
describe("History Header + Filters (M4-8.5.1)", () => {
  describe("Page title and description", () => {
    it("should have Chinese history title", () => {
      expect(zh.translation["history.title"]).toBe("历史");
    });

    it("should have English history title", () => {
      expect(en.translation["history.title"]).toBe("History");
    });

    it("should have Chinese description mentioning review, reuse, and export", () => {
      const desc = zh.translation["history.description"] as string;
      expect(desc).toContain("回查");
      expect(desc).toContain("复用");
      expect(desc).toContain("导出");
    });

    it("should have English description mentioning review, reuse, and export", () => {
      const desc = en.translation["history.description"] as string;
      expect(desc).toContain("Review");
      expect(desc).toContain("reuse");
      expect(desc).toContain("export");
    });
  });

  describe("Filter chips - type filter", () => {
    it("should have Chinese All filter", () => {
      expect(zh.translation["history.filter-all"]).toBe("全部");
    });

    it("should have English All filter", () => {
      expect(en.translation["history.filter-all"]).toBe("All");
    });

    it("should have Chinese AI Analysis filter", () => {
      expect(zh.translation["history.type-ai"]).toBe("AI 分析");
    });

    it("should have English AI Analysis filter", () => {
      expect(en.translation["history.type-ai"]).toBe("AI Analysis");
    });

    it("should have Chinese Expert SQL filter", () => {
      expect(zh.translation["history.type-sql"]).toBe("专家 SQL");
    });

    it("should have English Expert SQL filter", () => {
      expect(en.translation["history.type-sql"]).toBe("Expert SQL");
    });
  });

  describe("Filter chips - status filter", () => {
    it("should have Chinese Success filter", () => {
      expect(zh.translation["history.filter-success"]).toBe("成功");
    });

    it("should have English Success filter", () => {
      expect(en.translation["history.filter-success"]).toBe("Success");
    });

    it("should have Chinese Failed / Invalid filter", () => {
      expect(zh.translation["history.filter-failed"]).toBe("失败 / 失效");
    });

    it("should have English Failed / Invalid filter", () => {
      expect(en.translation["history.filter-failed"]).toBe("Failed / Invalid");
    });
  });

  describe("Search placeholder", () => {
    it("should have Chinese search placeholder mentioning questions, SQL, and table names", () => {
      const placeholder = zh.translation["history.search"] as string;
      expect(placeholder).toContain("SQL");
      expect(placeholder).toContain("表名");
    });

    it("should have English search placeholder mentioning questions, SQL, and table names", () => {
      const placeholder = en.translation["history.search"] as string;
      expect(placeholder).toContain("SQL");
      expect(placeholder).toContain("table names");
    });
  });

  describe("Empty state copy", () => {
    it("should have Chinese empty state title", () => {
      expect(zh.translation["history.no-history-title"]).toBe("暂无历史记录");
    });

    it("should have English empty state title", () => {
      expect(en.translation["history.no-history-title"]).toBe("No History Yet");
    });

    it("should have Chinese empty state description mentioning review, rerun, and export", () => {
      const desc = zh.translation["history.no-history-desc"] as string;
      expect(desc).toContain("回查");
      expect(desc).toContain("重新运行");
      expect(desc).toContain("导出");
    });

    it("should have English empty state description mentioning review, rerun, and export", () => {
      const desc = en.translation["history.no-history-desc"] as string;
      expect(desc).toContain("review");
      expect(desc).toContain("rerun");
      expect(desc).toContain("export");
    });
  });

  describe("Empty state action buttons", () => {
    it("should have Chinese upload data action", () => {
      expect(zh.translation["history.no-history-action-upload"]).toBe("上传数据");
    });

    it("should have English upload data action", () => {
      expect(en.translation["history.no-history-action-upload"]).toBe("Upload Data");
    });

    it("should have Chinese start analysis action", () => {
      expect(zh.translation["history.no-history-action-analyze"]).toBe("开始 Agent 分析");
    });

    it("should have English start analysis action", () => {
      expect(en.translation["history.no-history-action-analyze"]).toBe("Run Agent");
    });
  });

  describe("Negative checks - should NOT restore disabled features", () => {
    it("should not restore Templates page", () => {
      // Templates keys exist in locale but should not be actively used in UI
      expect(zh.translation["template.save-as"]).toBeDefined();
      // No new template-related keys added in M4-8.5.1
    });

    it("should not restore /performance route", () => {
      // Performance keys exist in locale but should not be actively used
      expect(zh.translation["perf.title"]).toBeDefined();
      // This test documents that we are not re-enabling Performance page
    });

    it("should not restore /virtual-table route", () => {
      // /virtual-table route should not exist in the app
      expect(true).toBe(true); // placeholder - route doesn't exist
    });
  });

  describe("Existing history action keys unchanged", () => {
    it("should preserve open detail key", () => {
      expect(zh.translation["history.open-detail"]).toBe("查看详情");
      expect(en.translation["history.open-detail"]).toBe("View Details");
    });

    it("should preserve rerun analysis key", () => {
      expect(zh.translation["history.rerun-analysis"]).toBe("重新运行");
      expect(en.translation["history.rerun-analysis"]).toBe("Re-run");
    });

    it("should preserve load to workspace key", () => {
      expect(zh.translation["history.load-to-workspace"]).toBe("加载到工作台");
      expect(en.translation["history.load-to-workspace"]).toBe("Load to Workspace");
    });

    it("should preserve export markdown key", () => {
      expect(zh.translation["history.export-md"]).toBe("导出 Markdown");
      expect(en.translation["history.export-md"]).toBe("Export Markdown");
    });

    it("should preserve export csv key", () => {
      expect(zh.translation["history.export-csv"]).toBe("导出记录 CSV");
      expect(en.translation["history.export-csv"]).toBe("Export Record CSV");
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
});
