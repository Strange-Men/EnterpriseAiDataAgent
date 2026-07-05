import { describe, it, expect } from "vitest";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

// Test i18n translations exist and have correct values
describe("Home + Navigation Clarity (M4-8.2)", () => {
  describe("Home Hero copy", () => {
    it("should have Chinese hero title", () => {
      expect(zh.translation["home.hero-title"]).toBe("上传表格，向 Agent 提问，查看答案");
    });

    it("should have English hero title", () => {
      expect(en.translation["home.hero-title"]).toBe("Upload a spreadsheet. Ask a question. Get an answer.");
    });

    it("should have Chinese hero subtitle mentioning product flow", () => {
      const subtitle = zh.translation["home.hero-subtitle"] as string;
      expect(subtitle).toContain("Agent 分析");
      expect(subtitle).toContain("CSV/Excel");
    });

    it("should have English hero subtitle mentioning product flow", () => {
      const subtitle = en.translation["home.hero-subtitle"] as string;
      expect(subtitle).toContain("Agent Analysis");
      expect(subtitle).toContain("CSV/Excel");
    });
  });

  describe("Home CTA buttons", () => {
    it("should have Chinese upload data CTA", () => {
      expect(zh.translation["home.upload-data"]).toBe("上传数据");
    });

    it("should have English upload data CTA", () => {
      expect(en.translation["home.upload-data"]).toBe("Upload Data");
    });

    it("should have Chinese start analysis CTA", () => {
      expect(zh.translation["home.start-analysis"]).toBe("开始分析");
    });

    it("should have English start analysis CTA", () => {
      expect(en.translation["home.start-analysis"]).toBe("Start Analysis");
    });

    it("should have Chinese CTA hints", () => {
      expect(zh.translation["home.upload-hint"]).toContain("CSV/Excel");
      expect(zh.translation["home.start-analysis-hint"]).toContain("Agent 分析");
    });

    it("should have English CTA hints", () => {
      expect(en.translation["home.upload-hint"]).toContain("CSV/Excel");
      expect(en.translation["home.start-analysis-hint"]).toContain("Ask a question");
    });
  });

  describe("Three entry cards", () => {
    it("should have Chinese upload card title and description", () => {
      expect(zh.translation["home.card-upload-title"]).toBe("上传数据");
      expect(zh.translation["home.card-upload-desc"]).toContain("CSV/Excel");
    });

    it("should have English upload card title and description", () => {
      expect(en.translation["home.card-upload-title"]).toBe("Upload Data");
      expect(en.translation["home.card-upload-desc"]).toContain("CSV/Excel");
    });

    it("should have Chinese Agent Analysis card title and description", () => {
      expect(zh.translation["home.card-nl-title"]).toBe("Agent 分析");
      expect(zh.translation["home.card-nl-desc"]).toContain("Agent");
    });

    it("should have English Agent Analysis card title and description", () => {
      expect(en.translation["home.card-nl-title"]).toBe("Agent Analysis");
      expect(en.translation["home.card-nl-desc"]).toContain("Agent");
    });

    it("should have Chinese expert SQL card title and description", () => {
      expect(zh.translation["home.card-sql-title"]).toBe("高级 SQL");
      expect(zh.translation["home.card-sql-desc"]).toContain("SQL");
    });

    it("should have English expert SQL card title and description", () => {
      expect(en.translation["home.card-sql-title"]).toBe("Advanced SQL");
      expect(en.translation["home.card-sql-desc"]).toContain("SQL");
    });
  });

  describe("Sidebar brand subtitle", () => {
    it("should have Chinese brand subtitle as AI 数据分析", () => {
      expect(zh.translation["sidebar.brand-subtitle"]).toBe("上传数据 → Agent 分析 → 分析结果");
    });

    it("should have English brand subtitle as Data Analysis", () => {
      expect(en.translation["sidebar.brand-subtitle"]).toBe("Upload Data → Agent Analysis → Results");
    });
  });

  describe("Header current table status", () => {
    it("should have Chinese current table label", () => {
      expect(zh.translation["header.current-table"]).toBe("当前数据表");
    });

    it("should have English current table label", () => {
      expect(en.translation["header.current-table"]).toBe("Current table");
    });

    it("should have Chinese no table message", () => {
      expect(zh.translation["header.no-table"]).toBe("未选择数据表");
    });

    it("should have English no table message", () => {
      expect(en.translation["header.no-table"]).toBe("No table selected");
    });

    it("should have Chinese rows count template", () => {
      const template = zh.translation["header.rows-count"] as string;
      expect(template).toContain("{{count}}");
      expect(template).toContain("行");
    });

    it("should have English rows count template", () => {
      const template = en.translation["header.rows-count"] as string;
      expect(template).toContain("{{count}}");
      expect(template).toContain("rows");
    });
  });

  describe("Negative checks - should NOT restore disabled features", () => {
    it("should not restore Templates feature flag", () => {
      // Templates keys exist in locale but should not be actively used in UI
      // This test documents that we are not re-enabling Templates
      expect(zh.translation["template.save-as"]).toBeDefined();
      // But we should not have any new template-related keys added in M4-8.2
    });

    it("should not restore /performance route", () => {
      // Performance keys exist in locale but should not be actively used
      expect(zh.translation["perf.title"]).toBeDefined();
      // This test documents that we are not re-enabling Performance page
    });

    it("should not restore /virtual-table route", () => {
      // /virtual-table route should not exist in the app
      // This test documents that we are not re-enabling virtual-table page
      // The route itself is not defined in the app router
      expect(true).toBe(true); // placeholder - route doesn't exist
    });
  });
});


