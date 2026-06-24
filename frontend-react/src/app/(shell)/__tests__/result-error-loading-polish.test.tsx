import { describe, it, expect } from "vitest";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

// M4-8.3.4 Result / Error / Loading States Polish
describe("Result / Error / Loading States Polish (M4-8.3.4)", () => {
  describe("SQL Loading State", () => {
    it("should have Chinese loading description", () => {
      const desc = zh.translation["sql.loading-description"] as string;
      expect(desc).toContain("SQL");
      expect(desc).toContain("查询");
    });

    it("should have English loading description", () => {
      const desc = en.translation["sql.loading-description"] as string;
      expect(desc.toLowerCase()).toContain("sql");
      expect(desc.toLowerCase()).toContain("query");
    });

    it("should have Chinese loading hint", () => {
      const hint = zh.translation["sql.loading-hint"] as string;
      expect(hint).toContain("结果");
    });

    it("should have English loading hint", () => {
      const hint = en.translation["sql.loading-hint"] as string;
      expect(hint.toLowerCase()).toContain("result");
    });
  });

  describe("SQL Error State", () => {
    it("should have Chinese friendly error title", () => {
      const title = zh.translation["sql.error-friendly"] as string;
      expect(title).toContain("失败");
      // Should NOT be just technical jargon
      expect(title.length).toBeLessThan(20);
    });

    it("should have English friendly error title", () => {
      const title = en.translation["sql.error-friendly"] as string;
      expect(title.toLowerCase()).toContain("failed");
    });

    it("should have Chinese error guidance suggesting action", () => {
      const guidance = zh.translation["sql.error-guidance"] as string;
      expect(guidance).toContain("检查");
    });

    it("should have English error guidance suggesting action", () => {
      const guidance = en.translation["sql.error-guidance"] as string;
      expect(guidance.toLowerCase()).toContain("check");
    });

    it("should have Chinese retry button text", () => {
      expect(zh.translation["sql.retry"]).toBeDefined();
    });

    it("should have English retry button text", () => {
      expect(en.translation["sql.retry"]).toBeDefined();
    });

    it("should have Chinese technical detail label", () => {
      expect(zh.translation["sql.error-technical-detail"]).toBe("技术详情");
    });

    it("should have English technical detail label", () => {
      expect(en.translation["sql.error-technical-detail"]).toBe("Technical Details");
    });
  });

  describe("SQL Empty Result State", () => {
    it("should have Chinese empty result title (not error)", () => {
      const title = zh.translation["sql.empty-result-title"] as string;
      expect(title).toContain("成功");
      // Must NOT contain error/failure words
      expect(title).not.toContain("失败");
      expect(title).not.toContain("错误");
    });

    it("should have English empty result title (not error)", () => {
      const title = en.translation["sql.empty-result-title"] as string;
      expect(title.toLowerCase()).toContain("succeeded");
      // Must NOT contain error/failure words
      expect(title.toLowerCase()).not.toContain("error");
      expect(title.toLowerCase()).not.toContain("failed");
    });

    it("should have Chinese empty result hint suggesting action", () => {
      const hint = zh.translation["sql.empty-result-hint"] as string;
      expect(hint).toContain("条件");
    });

    it("should have English empty result hint suggesting action", () => {
      const hint = en.translation["sql.empty-result-hint"] as string;
      expect(hint.toLowerCase()).toContain("filter");
    });
  });

  describe("SQL Success State", () => {
    it("should have Chinese success hint", () => {
      const hint = zh.translation["sql.success-hint"] as string;
      expect(hint).toContain("预览");
      expect(hint).toContain("导出");
    });

    it("should have English success hint", () => {
      const hint = en.translation["sql.success-hint"] as string;
      expect(hint.toLowerCase()).toContain("preview");
      expect(hint.toLowerCase()).toContain("export");
    });
  });

  describe("NL Loading State", () => {
    it("should have Chinese NL loading description", () => {
      const desc = zh.translation["inv.loading-description"] as string;
      expect(desc).toContain("SQL");
      expect(desc).toContain("分析");
    });

    it("should have English NL loading description", () => {
      const desc = en.translation["inv.loading-description"] as string;
      expect(desc.toLowerCase()).toContain("sql");
      expect(desc.toLowerCase()).toContain("analyzing");
    });

    it("should have Chinese NL loading hint", () => {
      const hint = zh.translation["inv.loading-hint"] as string;
      expect(hint).toContain("页面");
    });

    it("should have English NL loading hint", () => {
      const hint = en.translation["inv.loading-hint"] as string;
      expect(hint.toLowerCase()).toContain("page");
    });
  });

  describe("NL Error State", () => {
    it("should have Chinese friendly error title", () => {
      const title = zh.translation["inv.error-friendly"] as string;
      expect(title).toContain("失败");
    });

    it("should have English friendly error title", () => {
      const title = en.translation["inv.error-friendly"] as string;
      expect(title.toLowerCase()).toContain("failed");
    });

    it("should have Chinese error guidance suggesting fields", () => {
      const guidance = zh.translation["inv.error-guidance"] as string;
      expect(guidance).toContain("字段");
    });

    it("should have English error guidance suggesting fields", () => {
      const guidance = en.translation["inv.error-guidance"] as string;
      expect(guidance.toLowerCase()).toContain("fields");
    });

    it("should have Chinese technical detail label", () => {
      expect(zh.translation["inv.error-technical-detail"]).toBe("技术详情");
    });

    it("should have English technical detail label", () => {
      expect(en.translation["inv.error-technical-detail"]).toBe("Technical Details");
    });
  });

  describe("NL Success State", () => {
    it("should have Chinese success title", () => {
      const title = zh.translation["inv.success-title"] as string;
      expect(title).toContain("完成");
    });

    it("should have English success title", () => {
      const title = en.translation["inv.success-title"] as string;
      expect(title.toLowerCase()).toContain("complete");
    });

    it("should have Chinese success hint mentioning detail and history", () => {
      const hint = zh.translation["inv.success-hint"] as string;
      expect(hint).toContain("详情");
      expect(hint).toContain("历史");
    });

    it("should have English success hint mentioning detail and history", () => {
      const hint = en.translation["inv.success-hint"] as string;
      expect(hint.toLowerCase()).toContain("detail");
      expect(hint.toLowerCase()).toContain("history");
    });

    it("should have Chinese view detail button text", () => {
      expect(zh.translation["inv.view-detail-btn"]).toBe("查看详情");
    });

    it("should have English view detail button text", () => {
      expect(en.translation["inv.view-detail-btn"]).toBe("View Details");
    });
  });

  describe("Analysis Workspace Error State", () => {
    it("should have Chinese friendly error title", () => {
      const title = zh.translation["analysis.error-friendly"] as string;
      expect(title).toContain("失败");
    });

    it("should have English friendly error title", () => {
      const title = en.translation["analysis.error-friendly"] as string;
      expect(title.toLowerCase()).toContain("failed");
    });

    it("should have Chinese error guidance", () => {
      const guidance = zh.translation["analysis.error-guidance"] as string;
      expect(guidance).toContain("字段");
    });

    it("should have English error guidance", () => {
      const guidance = en.translation["analysis.error-guidance"] as string;
      expect(guidance.toLowerCase()).toContain("fields");
    });

    it("should have Chinese retry button", () => {
      expect(zh.translation["analysis.retry"]).toBe("重试");
    });

    it("should have English retry button", () => {
      expect(en.translation["analysis.retry"]).toBe("Retry");
    });

    it("should have Chinese technical detail label", () => {
      expect(zh.translation["analysis.error-technical-detail"]).toBe("技术详情");
    });

    it("should have English technical detail label", () => {
      expect(en.translation["analysis.error-technical-detail"]).toBe("Technical Details");
    });
  });

  describe("Negative checks - should NOT change", () => {
    it("should not change SQL execution logic keys", () => {
      expect(zh.translation["sql.execute"]).toBe("执行");
      expect(en.translation["sql.execute"]).toBe("Execute");
    });

    it("should not change AI generate SQL keys", () => {
      expect(zh.translation["ai.generate-sql"]).toBe("AI 生成 SQL");
      expect(en.translation["ai.generate-sql"]).toBe("AI Generate SQL");
    });

    it("should not change store-related keys", () => {
      expect(zh.translation["analysis.workspace"]).toBeDefined();
      expect(en.translation["analysis.workspace"]).toBeDefined();
    });

    it("should not restore Templates feature", () => {
      expect(zh.translation["template.save-as"]).toBeDefined();
    });

    it("should not restore Scheduler feature", () => {
      expect(zh.translation["schedule.title"]).toBeDefined();
    });

    it("should not restore Diff feature", () => {
      expect(zh.translation["diff.compare"]).toBeDefined();
    });

    it("should not restore Timeline feature", () => {
      expect(zh.translation["timeline.evolution"]).toBeDefined();
    });

    it("should not restore /performance route", () => {
      expect(zh.translation["perf.title"]).toBeDefined();
    });
  });
});
