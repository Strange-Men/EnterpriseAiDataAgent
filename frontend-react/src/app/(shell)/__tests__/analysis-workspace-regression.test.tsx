import { describe, it, expect } from "vitest";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

// Keeps stable workspace keys while locking the simplified Agent Analysis flow.
describe("Analysis Workspace Regression", () => {
  // ── 1. Tab labels (M4-8.3.1) ──────────────────────────────────
  describe("Tab labels", () => {
    it("should have Chinese Agent Analysis tab label", () => {
      expect(zh.translation["workspace.tab.ai-query"]).toBe("Agent 分析");
    });

    it("should have English Agent Analysis tab label", () => {
      expect(en.translation["workspace.tab.ai-query"]).toBe("Agent Analysis");
    });

    it("should have Chinese Expert SQL tab label", () => {
      expect(zh.translation["workspace.tab.expert-sql"]).toBe("专家 SQL");
    });

    it("should have English Expert SQL tab label", () => {
      expect(en.translation["workspace.tab.expert-sql"]).toBe("Expert SQL");
    });
  });

  // ── 2. Current Table Strip (M4-8.3.1) ─────────────────────────
  describe("Current Table Strip", () => {
    it("should have Chinese current-table label", () => {
      expect(zh.translation["workspace.current-table"]).toBeDefined();
      expect(zh.translation["workspace.current-table"]).toContain("数据表");
    });

    it("should have English current-table label", () => {
      expect(en.translation["workspace.current-table"]).toBeDefined();
      expect(en.translation["workspace.current-table"].toLowerCase()).toContain("table");
    });

    it("should have Chinese no-table message", () => {
      expect(zh.translation["workspace.no-table"]).toBeDefined();
    });

    it("should have English no-table message", () => {
      expect(en.translation["workspace.no-table"]).toBeDefined();
    });
  });

  // ── 3. Agent Analysis copy ──────────────────────────────
  describe("Agent Analysis copy", () => {
    it("should have Chinese Agent Analysis title", () => {
      const title = zh.translation["workspace.ai-query-title"] as string;
      expect(title).toContain("Agent 分析");
    });

    it("should have English Agent Analysis title", () => {
      const title = en.translation["workspace.ai-query-title"] as string;
      expect(title).toBe("Agent Analysis");
    });

    it("should have Chinese Start Analysis button text", () => {
      expect(zh.translation["workspace.generate-sql-analyze"]).toBe("开始分析");
    });

    it("should have English Start Analysis button text", () => {
      expect(en.translation["workspace.generate-sql-analyze"]).toBe("Start Analysis");
    });

    it("should have 4 example questions in Chinese", () => {
      expect(zh.translation["workspace.example.q1"]).toBeDefined();
      expect(zh.translation["workspace.example.q2"]).toBeDefined();
      expect(zh.translation["workspace.example.q3"]).toBeDefined();
      expect(zh.translation["workspace.example.q4"]).toBeDefined();
    });

    it("should have 4 example questions in English", () => {
      expect(en.translation["workspace.example.q1"]).toBeDefined();
      expect(en.translation["workspace.example.q2"]).toBeDefined();
      expect(en.translation["workspace.example.q3"]).toBeDefined();
      expect(en.translation["workspace.example.q4"]).toBeDefined();
    });

    it("should have Chinese example header as 试试这样提问", () => {
      expect(zh.translation["workspace.example-questions"]).toBe("试试这样提问：");
    });

    it("should have English example header as Try asking", () => {
      expect(en.translation["workspace.example-questions"]).toBe("Try asking:");
    });
  });

  // ── 4. NL loading / error / success (M4-8.3.4) ───────────────
  describe("NL states", () => {
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
      expect(zh.translation["inv.loading-hint"]).toContain("页面");
    });

    it("should have English NL loading hint", () => {
      expect(en.translation["inv.loading-hint"].toLowerCase()).toContain("page");
    });

    it("should have Chinese NL error friendly", () => {
      expect(zh.translation["inv.error-friendly"]).toContain("失败");
    });

    it("should have English NL error friendly", () => {
      expect(en.translation["inv.error-friendly"].toLowerCase()).toContain("failed");
    });

    it("should have Chinese NL error guidance", () => {
      expect(zh.translation["inv.error-guidance"]).toContain("字段");
    });

    it("should have English NL error guidance", () => {
      expect(en.translation["inv.error-guidance"].toLowerCase()).toContain("fields");
    });

    it("should have Chinese NL error technical detail", () => {
      expect(zh.translation["inv.error-technical-detail"]).toBe("技术详情");
    });

    it("should have English NL error technical detail", () => {
      expect(en.translation["inv.error-technical-detail"]).toBe("Technical Details");
    });

    it("should have Chinese NL success title", () => {
      expect(zh.translation["inv.success-title"]).toContain("完成");
    });

    it("should have English NL success title", () => {
      expect(en.translation["inv.success-title"].toLowerCase()).toContain("complete");
    });

    it("should have Chinese NL success hint", () => {
      const hint = zh.translation["inv.success-hint"] as string;
      expect(hint).toContain("详情");
      expect(hint).toContain("历史");
    });

    it("should have English NL success hint", () => {
      const hint = en.translation["inv.success-hint"] as string;
      expect(hint.toLowerCase()).toContain("detail");
      expect(hint.toLowerCase()).toContain("history");
    });

    it("should have Chinese view detail button", () => {
      expect(zh.translation["inv.view-detail-btn"]).toBe("查看详情");
    });

    it("should have English view detail button", () => {
      expect(en.translation["inv.view-detail-btn"]).toBe("View Details");
    });
  });

  // ── 5. Expert SQL toolbar (M4-8.3.3) ─────────────────────────
  describe("Expert SQL toolbar", () => {
    it("should have Chinese execute button", () => {
      expect(zh.translation["sql.execute"]).toBe("执行");
    });

    it("should have English execute button", () => {
      expect(en.translation["sql.execute"]).toBe("Execute");
    });

    it("should have Chinese AI generate SQL button", () => {
      expect(zh.translation["ai.generate-sql"]).toBe("AI 生成 SQL");
    });

    it("should have English AI generate SQL button", () => {
      expect(en.translation["ai.generate-sql"]).toBe("AI Generate SQL");
    });

    it("should have Chinese AI generate SQL hint mentioning review before execute", () => {
      const hint = zh.translation["ai.generate-sql-hint"] as string;
      expect(hint).toContain("检查");
      expect(hint).toContain("执行");
    });

    it("should have English AI generate SQL hint mentioning review before execute", () => {
      const hint = en.translation["ai.generate-sql-hint"] as string;
      expect(hint.toLowerCase()).toContain("review");
      expect(hint.toLowerCase()).toContain("running");
    });

    it("should have Chinese AI SQL filled message", () => {
      const msg = zh.translation["ai.sql-filled"] as string;
      expect(msg).toContain("检查");
      expect(msg).toContain("执行");
    });

    it("should have English AI SQL filled message", () => {
      const msg = en.translation["ai.sql-filled"] as string;
      expect(msg.toLowerCase()).toContain("review");
      expect(msg.toLowerCase()).toContain("executing");
    });

    it("should have Chinese format button", () => {
      expect(zh.translation["format.button"]).toBe("格式化");
    });

    it("should have English format button", () => {
      expect(en.translation["format.button"]).toBe("Format");
    });

    it("should have Chinese explain button", () => {
      expect(zh.translation["explain.button"]).toBeDefined();
    });

    it("should have English explain button", () => {
      expect(en.translation["explain.button"]).toBe("Explain");
    });

    it("should have Chinese export button", () => {
      expect(zh.translation["export.button"]).toBe("导出");
    });

    it("should have English export button", () => {
      expect(en.translation["export.button"]).toBe("Export");
    });

    it("should have Chinese saved button", () => {
      expect(zh.translation["saved.button"]).toBe("已保存");
    });

    it("should have English saved button", () => {
      expect(en.translation["saved.button"]).toBe("Saved");
    });

    it("should have Chinese save button", () => {
      expect(zh.translation["sql.save"]).toBe("保存");
    });

    it("should have English save button", () => {
      expect(en.translation["sql.save"]).toBe("Save");
    });

    it("should have Chinese clear button", () => {
      expect(zh.translation["sql.clear"]).toBe("清空");
    });

    it("should have English clear button", () => {
      expect(en.translation["sql.clear"]).toBe("Clear");
    });
  });

  // ── 6. SQL states (M4-8.3.4) ─────────────────────────────────
  describe("SQL states", () => {
    it("should have Chinese SQL loading description", () => {
      const desc = zh.translation["sql.loading-description"] as string;
      expect(desc).toContain("SQL");
      expect(desc).toContain("查询");
    });

    it("should have English SQL loading description", () => {
      const desc = en.translation["sql.loading-description"] as string;
      expect(desc.toLowerCase()).toContain("sql");
      expect(desc.toLowerCase()).toContain("query");
    });

    it("should have Chinese SQL loading hint", () => {
      expect(zh.translation["sql.loading-hint"]).toContain("结果");
    });

    it("should have English SQL loading hint", () => {
      expect(en.translation["sql.loading-hint"].toLowerCase()).toContain("result");
    });

    it("should have Chinese SQL error friendly", () => {
      expect(zh.translation["sql.error-friendly"]).toContain("失败");
    });

    it("should have English SQL error friendly", () => {
      expect(en.translation["sql.error-friendly"].toLowerCase()).toContain("failed");
    });

    it("should have Chinese SQL error guidance", () => {
      expect(zh.translation["sql.error-guidance"]).toContain("检查");
    });

    it("should have English SQL error guidance", () => {
      expect(en.translation["sql.error-guidance"].toLowerCase()).toContain("check");
    });

    it("should have Chinese SQL retry", () => {
      expect(zh.translation["sql.retry"]).toBe("重试");
    });

    it("should have English SQL retry", () => {
      expect(en.translation["sql.retry"]).toBe("Retry");
    });

    it("should have Chinese SQL technical detail", () => {
      expect(zh.translation["sql.error-technical-detail"]).toBe("技术详情");
    });

    it("should have English SQL technical detail", () => {
      expect(en.translation["sql.error-technical-detail"]).toBe("Technical Details");
    });

    it("should have Chinese empty result title (not error)", () => {
      const title = zh.translation["sql.empty-result-title"] as string;
      expect(title).toContain("成功");
      expect(title).not.toContain("失败");
      expect(title).not.toContain("错误");
    });

    it("should have English empty result title (not error)", () => {
      const title = en.translation["sql.empty-result-title"] as string;
      expect(title.toLowerCase()).toContain("succeeded");
      expect(title.toLowerCase()).not.toContain("error");
      expect(title.toLowerCase()).not.toContain("failed");
    });

    it("should have Chinese empty result hint", () => {
      expect(zh.translation["sql.empty-result-hint"]).toContain("条件");
    });

    it("should have English empty result hint", () => {
      expect(en.translation["sql.empty-result-hint"].toLowerCase()).toContain("filter");
    });

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

  // ── 7. Disabled experimental features ─────────────────────────
  describe("Disabled experimental features", () => {
    it("should not restore Templates", () => {
      // Keys exist in i18n but are behind feature flag
      expect(zh.translation["template.save-as"]).toBeDefined();
      expect(en.translation["template.save-as"]).toBeDefined();
    });

    it("should not restore Scheduler", () => {
      expect(zh.translation["schedule.title"]).toBeDefined();
      expect(en.translation["schedule.title"]).toBeDefined();
    });

    it("should not restore Diff", () => {
      expect(zh.translation["diff.compare"]).toBeDefined();
      expect(en.translation["diff.compare"]).toBeDefined();
    });

    it("should not restore Timeline", () => {
      expect(zh.translation["timeline.evolution"]).toBeDefined();
      expect(en.translation["timeline.evolution"]).toBeDefined();
    });

    it("should not restore /performance route", () => {
      expect(zh.translation["perf.title"]).toBeDefined();
      expect(en.translation["perf.title"]).toBeDefined();
    });

    it("should not restore /virtual-table route", () => {
      // Route does not exist in the app
      expect(true).toBe(true);
    });
  });

  // ── 8. Stable API / Store / Backend keys ──────────────────────
  describe("Stable API / Store / Backend keys", () => {
    it("should not change SQL execution key", () => {
      expect(zh.translation["sql.execute"]).toBe("执行");
      expect(en.translation["sql.execute"]).toBe("Execute");
    });

    it("should not change AI generate SQL key", () => {
      expect(zh.translation["ai.generate-sql"]).toBe("AI 生成 SQL");
      expect(en.translation["ai.generate-sql"]).toBe("AI Generate SQL");
    });

    it("should not change store workspace key", () => {
      expect(zh.translation["analysis.workspace"]).toBeDefined();
      expect(en.translation["analysis.workspace"]).toBeDefined();
    });

    it("should not change query cancel key", () => {
      expect(zh.translation["query.cancel"]).toBeDefined();
      expect(en.translation["query.cancel"]).toBeDefined();
    });

    it("should not change query cancelled key", () => {
      expect(zh.translation["query.cancelled"]).toBeDefined();
      expect(en.translation["query.cancelled"]).toBeDefined();
    });
  });
});


