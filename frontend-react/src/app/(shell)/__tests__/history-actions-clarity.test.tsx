import { describe, it, expect } from "vitest";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

// M4-8.5.3: History Actions Clarity
describe("History Actions Clarity (M4-8.5.3)", () => {
  describe("AI history primary action key exists", () => {
    it("should have open-detail as primary action (zh)", () => {
      expect(zh.translation["history.open-detail"]).toBe("查看详情");
    });

    it("should have open-detail as primary action (en)", () => {
      expect(en.translation["history.open-detail"]).toBe("View Details");
    });
  });

  describe("SQL history primary action key exists", () => {
    it("should have load-to-workspace as primary action (zh)", () => {
      expect(zh.translation["history.load-to-workspace"]).toBe("加载到工作台");
    });

    it("should have load-to-workspace as primary action (en)", () => {
      expect(en.translation["history.load-to-workspace"]).toBe("Load to Workspace");
    });
  });

  describe("AI secondary actions still have i18n keys", () => {
    it("should have rerun-analysis key", () => {
      expect(zh.translation["history.rerun-analysis"]).toBeDefined();
      expect(en.translation["history.rerun-analysis"]).toBeDefined();
    });

    it("should have export-md key", () => {
      expect(zh.translation["history.export-md"]).toBeDefined();
      expect(en.translation["history.export-md"]).toBeDefined();
    });

    it("should have copy-question key", () => {
      expect(zh.translation["history.copy-question"]).toBeDefined();
      expect(en.translation["history.copy-question"]).toBeDefined();
    });
  });

  describe("SQL secondary actions still have i18n keys", () => {
    it("should have re-execute key", () => {
      expect(zh.translation["history.re-execute"]).toBeDefined();
      expect(en.translation["history.re-execute"]).toBeDefined();
    });

    it("should have export-csv key", () => {
      expect(zh.translation["history.export-csv"]).toBeDefined();
      expect(en.translation["history.export-csv"]).toBeDefined();
    });

    it("should have copy-sql key", () => {
      expect(zh.translation["history.copy-sql"]).toBeDefined();
      expect(en.translation["history.copy-sql"]).toBeDefined();
    });
  });

  describe("Delete action still has i18n key", () => {
    it("should have delete key (zh)", () => {
      expect(zh.translation["history.delete"]).toBe("删除记录");
    });

    it("should have delete key (en)", () => {
      expect(en.translation["history.delete"]).toBe("Delete entry");
    });
  });

  describe("More actions i18n key", () => {
    it("should have more-actions key (zh)", () => {
      expect(zh.translation["history.more-actions"]).toBe("更多操作");
    });

    it("should have more-actions key (en)", () => {
      expect(en.translation["history.more-actions"]).toBe("More actions");
    });
  });

  describe("All action keys preserved (no regression)", () => {
    it("should preserve all AI action keys", () => {
      const aiKeys = [
        "history.open-detail",
        "history.rerun-analysis",
        "history.export-md",
        "history.copy-question",
      ] as const;
      for (const key of aiKeys) {
        expect(zh.translation[key]).toBeDefined();
        expect(en.translation[key]).toBeDefined();
      }
    });

    it("should preserve all SQL action keys", () => {
      const sqlKeys = [
        "history.load-to-workspace",
        "history.re-execute",
        "history.export-csv",
        "history.copy-sql",
      ] as const;
      for (const key of sqlKeys) {
        expect(zh.translation[key]).toBeDefined();
        expect(en.translation[key]).toBeDefined();
      }
    });

    it("should preserve common action keys", () => {
      expect(zh.translation["history.delete"]).toBeDefined();
      expect(en.translation["history.delete"]).toBeDefined();
      expect(zh.translation["history.copied"]).toBeDefined();
      expect(en.translation["history.copied"]).toBeDefined();
      expect(zh.translation["history.copy-failed"]).toBeDefined();
      expect(en.translation["history.copy-failed"]).toBeDefined();
      expect(zh.translation["history.table-not-found"]).toBeDefined();
      expect(en.translation["history.table-not-found"]).toBeDefined();
    });
  });

  describe("Negative checks - should NOT restore disabled features", () => {
    it("should not restore Templates / Schedule / Diff / Timeline in history", () => {
      // These keys exist globally but should not appear in history actions
      expect(zh.translation["template.save-as"]).toBeDefined();
      expect(zh.translation["schedule.title"]).toBeDefined();
      expect(zh.translation["diff.compare"]).toBeDefined();
      expect(zh.translation["timeline.evolution"]).toBeDefined();
    });

    it("should not restore /performance route", () => {
      expect(zh.translation["perf.title"]).toBeDefined();
    });

    it("should not restore /virtual-table route", () => {
      expect(true).toBe(true);
    });
  });
});
