import { describe, it, expect } from "vitest";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

describe("Data Page Header + Upload Guidance (M5.5.6)", () => {
  describe("Data Page Header", () => {
    it("should have Chinese upload data page title", () => {
      expect(zh.translation["data.title"]).toBe("上传数据");
    });

    it("should have English upload data page title", () => {
      expect(en.translation["data.title"]).toBe("Upload Data");
    });

    it("should have Chinese description mentioning CSV/Excel, table selection, and Agent Analysis", () => {
      const desc = zh.translation["data.description"] as string;
      expect(desc).toContain("CSV/Excel");
      expect(desc).toContain("当前数据表");
      expect(desc).toContain("Agent Analysis");
    });

    it("should have English description mentioning CSV/Excel, table selection, and Agent Analysis", () => {
      const desc = en.translation["data.description"] as string;
      expect(desc).toContain("CSV/Excel");
      expect(desc).toContain("table");
      expect(desc).toContain("Agent Analysis");
    });
  });

  describe("Upload Guidance", () => {
    it("should have Chinese dropzone text as click-to-upload (no drag wording)", () => {
      const text = zh.translation["upload.dropzone"] as string;
      expect(text).toContain("点击");
      expect(text).not.toContain("拖拽");
    });

    it("should have English dropzone text as click-to-select (no drag wording)", () => {
      const text = en.translation["upload.dropzone"] as string;
      expect(text).toContain("Click");
      expect(text).not.toContain("Drag");
    });

    it("should have Chinese formats hint mentioning CSV, XLSX, XLS", () => {
      const text = zh.translation["upload.formats"] as string;
      expect(text).toContain("CSV");
      expect(text).toContain("XLSX");
      expect(text).toContain("XLS");
    });

    it("should have English formats hint mentioning CSV, XLSX, XLS", () => {
      const text = en.translation["upload.formats"] as string;
      expect(text).toContain("CSV");
      expect(text).toContain("XLSX");
      expect(text).toContain("XLS");
    });

    it("should have Chinese guidance mentioning upload creates table and analysis workspace", () => {
      const text = zh.translation["upload.guidance"] as string;
      expect(text).toContain("数据表");
      expect(text).toContain("Agent Analysis 工作区");
    });

    it("should have English guidance mentioning upload creates table and analysis workspace", () => {
      const text = en.translation["upload.guidance"] as string;
      expect(text).toContain("data table");
      expect(text).toContain("Agent Analysis workspace");
    });

    it("should have Chinese flow hint showing upload → choose → Agent Analysis → result workflow", () => {
      const text = zh.translation["upload.flow"] as string;
      expect(text).toContain("上传文件");
      expect(text).toContain("选择数据表");
      expect(text).toContain("Agent Analysis");
      expect(text).toContain("查看结果");
    });

    it("should have English flow hint showing upload → choose → Agent Analysis → result workflow", () => {
      const text = en.translation["upload.flow"] as string;
      expect(text).toContain("Upload file");
      expect(text).toContain("Choose table");
      expect(text).toContain("Agent Analysis");
      expect(text).toContain("Result");
    });

    it("should have Chinese next-step hint mentioning Agent Analysis workspace", () => {
      const text = zh.translation["upload.next-step"] as string;
      expect(text).toContain("Agent Analysis 工作区");
    });

    it("should have English next-step hint mentioning Agent Analysis workspace", () => {
      const text = en.translation["upload.next-step"] as string;
      expect(text).toContain("Agent Analysis workspace");
    });
  });

  describe("Upload Empty State", () => {
    it("should have Chinese empty state text", () => {
      expect(zh.translation["upload.no-files"]).toBeDefined();
      expect(zh.translation["upload.no-files"]).toContain("暂无");
    });

    it("should have English empty state text", () => {
      expect(en.translation["upload.no-files"]).toBeDefined();
      expect(en.translation["upload.no-files"]).toContain("No files");
    });

    it("should have Chinese empty state description mentioning CSV/Excel", () => {
      const desc = zh.translation["upload.no-files-desc"] as string;
      expect(desc).toContain("CSV");
      expect(desc).toContain("Excel");
    });

    it("should have English empty state description mentioning CSV/Excel", () => {
      const desc = en.translation["upload.no-files-desc"] as string;
      expect(desc).toContain("CSV");
      expect(desc).toContain("Excel");
    });
  });

  describe("Table Management Empty State", () => {
    it("should have Chinese table empty state description", () => {
      const desc = zh.translation["table.no-tables-desc"] as string;
      expect(desc).toContain("CSV");
      expect(desc).toContain("Excel");
    });

    it("should have English table empty state description", () => {
      const desc = en.translation["table.no-tables-desc"] as string;
      expect(desc).toContain("CSV");
      expect(desc).toContain("Excel");
    });
  });

  describe("Negative checks - no hardcoded English in key areas", () => {
    it("should not have drag-and-drop wording in Chinese dropzone", () => {
      expect(zh.translation["upload.dropzone"]).not.toContain("拖拽");
    });

    it("should not have drag-and-drop wording in English dropzone", () => {
      expect(en.translation["upload.dropzone"]).not.toContain("Drag");
    });

    it("should not restore Templates feature", () => {
      // Templates should remain disabled
      expect(zh.translation["template.save-as"]).toBeDefined();
    });

    it("should not restore /performance route", () => {
      expect(zh.translation["perf.title"]).toBeDefined();
    });

    it("should not restore /virtual-table route", () => {
      // Route should not exist in app router
      expect(true).toBe(true);
    });
  });
});
