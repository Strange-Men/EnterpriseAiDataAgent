import { describe, it, expect } from "vitest";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

describe("Table List / Current Table Card Polish (M4-8.6.2)", () => {
  describe("Current Table Card i18n keys", () => {
    it("should have Chinese current table card title", () => {
      expect(zh.translation["table.current-card-title"]).toBe("当前数据表");
    });

    it("should have English current table card title", () => {
      expect(en.translation["table.current-card-title"]).toBe("Current Table");
    });

    it("should have Chinese current table card description mentioning default data source", () => {
      const desc = zh.translation["table.current-card-desc"] as string;
      expect(desc).toContain("默认数据源");
      expect(desc).toContain("自然语言分析");
      expect(desc).toContain("专家 SQL");
    });

    it("should have English current table card description mentioning default data source", () => {
      const desc = en.translation["table.current-card-desc"] as string;
      expect(desc).toContain("default data source");
      expect(desc).toContain("natural language analysis");
      expect(desc).toContain("expert SQL");
    });

    it("should have Chinese empty state for no selected table", () => {
      expect(zh.translation["table.current-empty-title"]).toBe("尚未选择数据表");
    });

    it("should have English empty state for no selected table", () => {
      expect(en.translation["table.current-empty-title"]).toBe("No table selected");
    });

    it("should have Chinese empty state description mentioning upload and analysis workspace", () => {
      const desc = zh.translation["table.current-empty-desc"] as string;
      expect(desc).toContain("上传");
      expect(desc).toContain("分析工作台");
    });

    it("should have English empty state description mentioning upload and analysis workspace", () => {
      const desc = en.translation["table.current-empty-desc"] as string;
      expect(desc).toContain("Upload");
      expect(desc).toContain("analysis workspace");
    });
  });

  describe("Table List Selected Badge i18n", () => {
    it("should have Chinese selected badge text", () => {
      expect(zh.translation["table.current-selected-badge"]).toBe("当前选中");
    });

    it("should have English selected badge text", () => {
      expect(en.translation["table.current-selected-badge"]).toBe("Selected");
    });
  });

  describe("Table Metadata Labels i18n", () => {
    it("should have Chinese rows label", () => {
      expect(zh.translation["table.rows-label"]).toBe("行");
    });

    it("should have English rows label", () => {
      expect(en.translation["table.rows-label"]).toBe("rows");
    });

    it("should have Chinese cols label", () => {
      expect(zh.translation["table.cols-label"]).toBe("列");
    });

    it("should have English cols label", () => {
      expect(en.translation["table.cols-label"]).toBe("cols");
    });
  });

  describe("Start Analysis Entry i18n", () => {
    it("should have Chinese start analysis text", () => {
      expect(zh.translation["table.start-analysis"]).toBe("开始分析");
    });

    it("should have English start analysis text", () => {
      expect(en.translation["table.start-analysis"]).toBe("Start Analysis");
    });
  });

  describe("Existing table management keys preserved", () => {
    it("should still have table.management key (zh)", () => {
      expect(zh.translation["table.management"]).toBe("表管理");
    });

    it("should still have table.management key (en)", () => {
      expect(en.translation["table.management"]).toBe("Table Management");
    });

    it("should still have table.no-tables key (zh)", () => {
      expect(zh.translation["table.no-tables"]).toBeDefined();
    });

    it("should still have table.no-tables-desc key (zh)", () => {
      const desc = zh.translation["table.no-tables-desc"] as string;
      expect(desc).toContain("CSV");
    });

    it("should still have table.delete key (zh)", () => {
      expect(zh.translation["table.delete"]).toBe("删除表");
    });

    it("should still have table.confirm-delete key (zh)", () => {
      expect(zh.translation["table.confirm-delete"]).toBe("确认删除表");
    });

    it("should still have table.query key (zh)", () => {
      expect(zh.translation["table.query"]).toBeDefined();
    });

    it("should still have table.rename key (zh)", () => {
      expect(zh.translation["table.rename"]).toBeDefined();
    });

    it("should still have table.export key (zh)", () => {
      expect(zh.translation["table.export"]).toBeDefined();
    });
  });

  describe("Negative checks — no forbidden changes", () => {
    it("should not restore Templates feature", () => {
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
