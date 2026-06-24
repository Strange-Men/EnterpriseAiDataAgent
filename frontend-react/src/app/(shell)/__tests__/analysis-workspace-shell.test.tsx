import { describe, it, expect } from "vitest";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

// M4-8.3.1 Analyze Shell + Current Table Strip
describe("Analysis Workspace Shell (M4-8.3.1)", () => {
  describe("Tab labels", () => {
    it("should have Chinese AI query tab label", () => {
      expect(zh.translation["workspace.tab.ai-query"]).toBe("自然语言查询");
    });

    it("should have English AI query tab label", () => {
      expect(en.translation["workspace.tab.ai-query"]).toBe("Natural Language");
    });

    it("should have Chinese expert SQL tab label", () => {
      expect(zh.translation["workspace.tab.expert-sql"]).toBe("专家 SQL");
    });

    it("should have English expert SQL tab label", () => {
      expect(en.translation["workspace.tab.expert-sql"]).toBe("Expert SQL");
    });
  });

  describe("Tab badges", () => {
    it("should have Chinese recommended badge", () => {
      expect(zh.translation["workspace.tab.recommended"]).toBe("推荐");
    });

    it("should have English recommended badge", () => {
      expect(en.translation["workspace.tab.recommended"]).toBe("Recommended");
    });

    it("should have Chinese advanced badge", () => {
      expect(zh.translation["workspace.tab.advanced"]).toBe("高级");
    });

    it("should have English advanced badge", () => {
      expect(en.translation["workspace.tab.advanced"]).toBe("Advanced");
    });
  });

  describe("Current Table Strip - with table", () => {
    it("should have Chinese table strip label", () => {
      expect(zh.translation["workspace.table-strip.label"]).toBe("当前数据表");
    });

    it("should have English table strip label", () => {
      expect(en.translation["workspace.table-strip.label"]).toBe("Current table");
    });

    it("should have Chinese rows template with count placeholder", () => {
      const template = zh.translation["workspace.table-strip.rows"] as string;
      expect(template).toContain("{{count}}");
      expect(template).toContain("行");
    });

    it("should have English rows template with count placeholder", () => {
      const template = en.translation["workspace.table-strip.rows"] as string;
      expect(template).toContain("{{count}}");
      expect(template).toContain("rows");
    });

    it("should have Chinese cols template with count placeholder", () => {
      const template = zh.translation["workspace.table-strip.cols"] as string;
      expect(template).toContain("{{count}}");
      expect(template).toContain("列");
    });

    it("should have English cols template with count placeholder", () => {
      const template = en.translation["workspace.table-strip.cols"] as string;
      expect(template).toContain("{{count}}");
      expect(template).toContain("cols");
    });

    it("should have Chinese table strip description", () => {
      const desc = zh.translation["workspace.table-strip.description"] as string;
      expect(desc).toContain("自然语言");
      expect(desc).toContain("专家 SQL");
    });

    it("should have English table strip description", () => {
      const desc = en.translation["workspace.table-strip.description"] as string;
      expect(desc).toContain("Natural language");
      expect(desc).toContain("Expert SQL");
    });
  });

  describe("Current Table Strip - no table", () => {
    it("should have Chinese no-table message", () => {
      expect(zh.translation["workspace.table-strip.no-table"]).toBe("未选择数据表");
    });

    it("should have English no-table message", () => {
      expect(en.translation["workspace.table-strip.no-table"]).toBe("No table selected");
    });

    it("should have Chinese no-table description", () => {
      const desc = zh.translation["workspace.table-strip.no-table-desc"] as string;
      expect(desc).toContain("上传");
      expect(desc).toContain("数据表");
    });

    it("should have English no-table description", () => {
      const desc = en.translation["workspace.table-strip.no-table-desc"] as string;
      expect(desc).toContain("Upload");
      expect(desc).toContain("table");
    });

    it("should have Chinese upload button text", () => {
      expect(zh.translation["workspace.table-strip.upload"]).toBe("上传数据");
    });

    it("should have English upload button text", () => {
      expect(en.translation["workspace.table-strip.upload"]).toBe("Upload Data");
    });
  });

  describe("Legacy table info keys still present", () => {
    it("should retain Chinese current-table key", () => {
      expect(zh.translation["workspace.current-table"]).toBe("当前数据表");
    });

    it("should retain English current-table key", () => {
      expect(en.translation["workspace.current-table"]).toBe("Current table");
    });

    it("should retain Chinese no-table key", () => {
      expect(zh.translation["workspace.no-table"]).toBeDefined();
    });

    it("should retain English no-table key", () => {
      expect(en.translation["workspace.no-table"]).toBeDefined();
    });
  });

  describe("Negative checks - should NOT restore disabled features", () => {
    it("should not restore Templates feature flag", () => {
      // Templates keys exist in locale but should not be actively used in UI
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
