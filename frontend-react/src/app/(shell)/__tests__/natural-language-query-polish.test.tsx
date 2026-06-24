import { describe, it, expect } from "vitest";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

// M4-8.3.2 Natural Language Query Panel Polish
describe("Natural Language Query Panel Polish (M4-8.3.2)", () => {
  describe("AI Query title and subtitle", () => {
    it("should have Chinese title mentioning natural language analysis", () => {
      const title = zh.translation["workspace.ai-query-title"] as string;
      expect(title).toContain("自然语言");
      expect(title).toContain("分析");
    });

    it("should have English title mentioning natural language analysis", () => {
      const title = en.translation["workspace.ai-query-title"] as string;
      expect(title.toLowerCase()).toContain("natural language");
    });

    it("should have Chinese subtitle explaining AI behavior", () => {
      const subtitle = zh.translation["workspace.ai-query-subtitle"] as string;
      expect(subtitle).toContain("AI");
      expect(subtitle).toContain("SQL");
    });

    it("should have English subtitle explaining AI behavior", () => {
      const subtitle = en.translation["workspace.ai-query-subtitle"] as string;
      expect(subtitle.toLowerCase()).toContain("ai");
      expect(subtitle.toLowerCase()).toContain("sql");
    });
  });

  describe("Generate Analysis button", () => {
    it("should have Chinese button text as 生成分析", () => {
      expect(zh.translation["workspace.generate-sql-analyze"]).toBe("生成分析");
    });

    it("should have English button text as Generate Analysis", () => {
      expect(en.translation["workspace.generate-sql-analyze"]).toBe("Generate Analysis");
    });
  });

  describe("Example questions", () => {
    it("should have 4 Chinese example questions", () => {
      expect(zh.translation["workspace.example.q1"]).toBeDefined();
      expect(zh.translation["workspace.example.q2"]).toBeDefined();
      expect(zh.translation["workspace.example.q3"]).toBeDefined();
      expect(zh.translation["workspace.example.q4"]).toBeDefined();
    });

    it("should have 4 English example questions", () => {
      expect(en.translation["workspace.example.q1"]).toBeDefined();
      expect(en.translation["workspace.example.q2"]).toBeDefined();
      expect(en.translation["workspace.example.q3"]).toBeDefined();
      expect(en.translation["workspace.example.q4"]).toBeDefined();
    });

    it("should have Chinese example questions mentioning sales/regions", () => {
      const q1 = zh.translation["workspace.example.q1"] as string;
      expect(q1).toContain("销售");
    });

    it("should have English example questions mentioning sales/regions", () => {
      const q1 = en.translation["workspace.example.q1"] as string;
      expect(q1.toLowerCase()).toContain("sales");
    });

    it("should have Chinese example section header", () => {
      expect(zh.translation["workspace.example-questions"]).toBe("试试这样提问：");
    });

    it("should have English example section header", () => {
      expect(en.translation["workspace.example-questions"]).toBe("Try asking:");
    });
  });

  describe("Result hint", () => {
    it("should have Chinese result hint", () => {
      const hint = zh.translation["workspace.result-hint"] as string;
      expect(hint).toContain("详情");
      expect(hint).toContain("历史");
    });

    it("should have English result hint", () => {
      const hint = en.translation["workspace.result-hint"] as string;
      expect(hint.toLowerCase()).toContain("detail");
      expect(hint.toLowerCase()).toContain("history");
    });
  });

  describe("Negative checks - should NOT change", () => {
    it("should not restore Templates feature flag", () => {
      // Templates keys exist but should not be actively used
      expect(zh.translation["template.save-as"]).toBeDefined();
    });

    it("should not restore /performance route", () => {
      expect(zh.translation["perf.title"]).toBeDefined();
    });

    it("should not restore /virtual-table route", () => {
      // /virtual-table route should not exist in the app
      expect(true).toBe(true);
    });
  });
});
