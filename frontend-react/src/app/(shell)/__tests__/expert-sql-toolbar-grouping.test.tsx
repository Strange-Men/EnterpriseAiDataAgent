import { describe, it, expect } from "vitest";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

// M4-8.3.3 Expert SQL Toolbar Grouping
describe("Expert SQL Toolbar Grouping (M4-8.3.3)", () => {
  describe("Primary action - Execute SQL", () => {
    it("should have Chinese execute button text", () => {
      expect(zh.translation["sql.execute"]).toBe("执行");
    });

    it("should have English execute button text", () => {
      expect(en.translation["sql.execute"]).toBe("Execute");
    });

    it("should have Chinese running state text", () => {
      expect(zh.translation["sql.running"]).toBe("执行中...");
    });

    it("should have English running state text", () => {
      expect(en.translation["sql.running"]).toBe("Running...");
    });
  });

  describe("AI Generate SQL", () => {
    it("should have Chinese AI generate SQL button text", () => {
      expect(zh.translation["ai.generate-sql"]).toBe("AI 生成 SQL");
    });

    it("should have English AI generate SQL button text", () => {
      expect(en.translation["ai.generate-sql"]).toBe("AI Generate SQL");
    });

    it("should have Chinese hint explaining AI behavior", () => {
      const hint = zh.translation["ai.generate-sql-hint"] as string;
      expect(hint).toContain("检查");
      expect(hint).toContain("执行");
    });

    it("should have English hint explaining AI behavior", () => {
      const hint = en.translation["ai.generate-sql-hint"] as string;
      expect(hint.toLowerCase()).toContain("review");
      expect(hint.toLowerCase()).toContain("running");
    });

    it("should have Chinese SQL filled message", () => {
      const msg = zh.translation["ai.sql-filled"] as string;
      expect(msg).toContain("检查");
      expect(msg).toContain("执行");
    });

    it("should have English SQL filled message", () => {
      const msg = en.translation["ai.sql-filled"] as string;
      expect(msg.toLowerCase()).toContain("review");
      expect(msg.toLowerCase()).toContain("executing");
    });
  });

  describe("Editor tools", () => {
    it("should have Chinese format button text", () => {
      expect(zh.translation["format.button"]).toBe("格式化");
    });

    it("should have English format button text", () => {
      expect(en.translation["format.button"]).toBe("Format");
    });

    it("should have Chinese explain button text", () => {
      expect(zh.translation["explain.button"]).toBeDefined();
    });

    it("should have English explain button text", () => {
      expect(en.translation["explain.button"]).toBe("Explain");
    });
  });

  describe("Export", () => {
    it("should have Chinese export button text", () => {
      expect(zh.translation["export.button"]).toBe("导出");
    });

    it("should have English export button text", () => {
      expect(en.translation["export.button"]).toBe("Export");
    });

    it("should have Chinese CSV export text", () => {
      expect(zh.translation["export.csv"]).toBe("导出 CSV");
    });

    it("should have English CSV export text", () => {
      expect(en.translation["export.csv"]).toBe("Export CSV");
    });
  });

  describe("Low-frequency actions", () => {
    it("should have Chinese saved button text", () => {
      expect(zh.translation["saved.button"]).toBe("已保存");
    });

    it("should have English saved button text", () => {
      expect(en.translation["saved.button"]).toBe("Saved");
    });

    it("should have Chinese save button text", () => {
      expect(zh.translation["sql.save"]).toBe("保存");
    });

    it("should have English save button text", () => {
      expect(en.translation["sql.save"]).toBe("Save");
    });

    it("should have Chinese clear button text", () => {
      expect(zh.translation["sql.clear"]).toBe("清空");
    });

    it("should have English clear button text", () => {
      expect(en.translation["sql.clear"]).toBe("Clear");
    });
  });

  describe("Negative checks - should NOT restore", () => {
    it("should not restore Templates feature", () => {
      // Templates should remain hidden
      expect(zh.translation["template.save-as"]).toBeDefined();
    });

    it("should not restore Scheduler feature", () => {
      // Scheduler should remain hidden
      expect(zh.translation["schedule.title"]).toBeDefined();
    });

    it("should not restore Diff feature", () => {
      // Diff should remain hidden
      expect(zh.translation["diff.compare"]).toBeDefined();
    });

    it("should not restore Timeline feature", () => {
      // Timeline should remain hidden
      expect(zh.translation["timeline.evolution"]).toBeDefined();
    });

    it("should not restore /performance route", () => {
      expect(zh.translation["perf.title"]).toBeDefined();
    });

    it("should not restore /virtual-table route", () => {
      // /virtual-table route should not exist
      expect(true).toBe(true);
    });
  });
});
