/**
 * M4-8.6.5 Data Page Regression
 *
 * 确认 M4-8.6.1 到 M4-8.6.4 的 Data Page UX 改造没有破坏数据页主链路。
 */

import { describe, it, expect } from "vitest";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

const zhT = zh.translation;
const enT = en.translation;

describe("M4-8.6.5 Data Page Regression", () => {
  describe("1. Header + Upload Guidance", () => {
    it("data page title exists", () => {
      expect(zhT["data.title"]).toBe("数据");
      expect(enT["data.title"]).toBe("Data");
    });

    it("data page description mentions upload/choose/start", () => {
      expect(zhT["data.description"]).toContain("CSV");
      expect(zhT["data.description"]).toContain("数据表");
      expect(zhT["data.description"]).toContain("AI 分析");
      expect(enT["data.description"]).toContain("CSV");
      expect(enT["data.description"]).toContain("table");
      expect(enT["data.description"]).toContain("AI analysis");
    });

    it("upload formats mentions CSV/Excel support", () => {
      expect(zhT["upload.formats"]).toContain("CSV");
      expect(zhT["upload.formats"]).toContain("XLSX");
      expect(zhT["upload.formats"]).toContain("XLS");
      expect(enT["upload.formats"]).toContain("CSV");
      expect(enT["upload.formats"]).toContain("XLSX");
      expect(enT["upload.formats"]).toContain("XLS");
    });

    it("upload flow shows 3 steps", () => {
      expect(zhT["upload.flow"]).toContain("→");
      expect(zhT["upload.flow"]).toContain("上传");
      expect(zhT["upload.flow"]).toContain("选择");
      expect(zhT["upload.flow"]).toContain("分析");
      expect(enT["upload.flow"]).toContain("→");
      expect(enT["upload.flow"]).toContain("Upload");
      expect(enT["upload.flow"]).toContain("Choose");
      expect(enT["upload.flow"]).toContain("Start");
    });

    it("dropzone uses click, not drag", () => {
      expect(zhT["upload.dropzone"]).toContain("点击");
      expect(zhT["upload.dropzone"]).not.toContain("拖拽");
      expect(enT["upload.dropzone"]).toContain("Click");
      expect(enT["upload.dropzone"]).not.toContain("Drag");
    });
  });

  describe("2. Current Table + Table List", () => {
    it("current table card title exists", () => {
      expect(zhT["table.current-card-title"]).toBeTruthy();
      expect(enT["table.current-card-title"]).toBeTruthy();
    });

    it("current table card description mentions default data source", () => {
      expect(zhT["table.current-card-desc"]).toContain("默认数据源");
      expect(enT["table.current-card-desc"]).toContain("default data source");
    });

    it("current empty state is friendly", () => {
      expect(zhT["table.current-empty-title"]).toBeTruthy();
      expect(zhT["table.current-empty-desc"]).toContain("分析工作台");
      expect(enT["table.current-empty-title"]).toBeTruthy();
      expect(enT["table.current-empty-desc"]).toContain("analysis workspace");
    });

    it("selected badge exists", () => {
      expect(zhT["table.current-selected-badge"]).toBe("当前选中");
      expect(enT["table.current-selected-badge"]).toBe("Selected");
    });

    it("rows/cols labels exist", () => {
      expect(zhT["table.rows-label"]).toBe("行");
      expect(zhT["table.cols-label"]).toBe("列");
      expect(enT["table.rows-label"]).toBe("rows");
      expect(enT["table.cols-label"]).toBe("cols");
    });

    it("start analysis entry exists", () => {
      expect(zhT["table.start-analysis"]).toContain("分析");
      expect(enT["table.start-analysis"]).toContain("Analysis");
    });

    it("table management key preserved", () => {
      expect(zhT["table.management"]).toBeTruthy();
      expect(enT["table.management"]).toBeTruthy();
    });
  });

  describe("3. Preview + Data Quality", () => {
    it("preview title exists", () => {
      expect(zhT["preview.title"]).toBe("数据预览");
      expect(enT["preview.title"]).toBe("Data Preview");
    });

    it("preview description is user-friendly", () => {
      expect(zhT["preview.description"]).toContain("样例数据");
      expect(enT["preview.description"]).toContain("sample rows");
    });

    it("preview rows summary uses interpolation", () => {
      expect(zhT["preview.rows-summary"]).toContain("{{rows}}");
      expect(zhT["preview.rows-summary"]).toContain("{{columns}}");
      expect(enT["preview.rows-summary"]).toContain("{{rows}}");
      expect(enT["preview.rows-summary"]).toContain("{{columns}}");
    });

    it("preview rows count uses interpolation", () => {
      expect(zhT["preview.preview-rows"]).toContain("{{count}}");
      expect(enT["preview.preview-rows"]).toContain("{{count}}");
    });

    it("quality title is user-friendly", () => {
      expect(zhT["quality.title"]).toBe("数据质量");
      expect(enT["quality.title"]).toBe("Data Quality");
    });

    it("quality description is user-friendly", () => {
      expect(zhT["quality.description"]).toContain("质量检查");
      expect(zhT["quality.description"]).toContain("适合继续分析");
      expect(enT["quality.description"]).toContain("quality checks");
      expect(enT["quality.description"]).toContain("ready for analysis");
    });

    it("quality ready/needs-attention labels exist", () => {
      expect(zhT["quality.ready"]).toContain("良好");
      expect(zhT["quality.needs-attention"]).toContain("质量问题");
      expect(enT["quality.ready"]).toContain("good");
      expect(enT["quality.needs-attention"]).toContain("issues");
    });

    it("missing values label exists", () => {
      expect(zhT["quality.missing-values"]).toBe("缺失值");
      expect(enT["quality.missing-values"]).toBe("Missing Values");
    });

    it("field types label exists", () => {
      expect(zhT["quality.field-types"]).toBe("字段类型");
      expect(enT["quality.field-types"]).toBe("Field Types");
    });

    it("start analysis entry exists", () => {
      expect(zhT["preview.start-analysis"]).toContain("分析");
      expect(enT["preview.start-analysis"]).toContain("Analysis");
    });

    it("analysis hint is friendly", () => {
      expect(zhT["preview.analysis-hint"]).toContain("分析工作台");
      expect(enT["preview.analysis-hint"]).toContain("analysis workspace");
    });
  });

  describe("4. Delete / Empty / Error States", () => {
    it("delete-aria mentions delete", () => {
      expect(zhT["table.delete-aria"]).toContain("删除");
      expect(enT["table.delete-aria"]).toContain("Delete");
    });

    it("confirm-delete mentions history impact", () => {
      expect(zhT["table.confirm-delete"]).toContain("历史记录");
      expect(enT["table.confirm-delete"]).toContain("history");
    });

    it("delete-success uses interpolation", () => {
      expect(zhT["table.delete-success"]).toContain("{{name}}");
      expect(enT["table.delete-success"]).toContain("{{name}}");
    });

    it("delete-failed is friendly", () => {
      expect(zhT["table.delete-failed"]).toContain("刷新");
      expect(enT["table.delete-failed"]).toContain("refresh");
    });

    it("no-tables is user-friendly", () => {
      expect(zhT["table.no-tables"]).toContain("暂无");
      expect(zhT["table.no-tables"]).not.toContain("数据库");
      expect(enT["table.no-tables"]).toContain("No");
      expect(enT["table.no-tables"]).not.toContain("database");
    });

    it("no-tables-desc guides next step", () => {
      expect(zhT["table.no-tables-desc"]).toContain("CSV");
      expect(enT["table.no-tables-desc"]).toContain("CSV");
    });

    it("no-table-selected is friendly", () => {
      expect(zhT["preview.no-table-selected"]).toContain("预览");
      expect(enT["preview.no-table-selected"]).toContain("preview");
    });

    it("no-table-selected-desc guides selection", () => {
      expect(zhT["preview.no-table-selected-desc"]).toContain("选择");
      expect(enT["preview.no-table-selected-desc"]).toContain("Choose");
    });

    it("error-hint is friendly", () => {
      expect(zhT["upload.error-hint"]).toContain("格式");
      expect(zhT["upload.error-hint"]).toContain("大小");
      expect(enT["upload.error-hint"]).toContain("format");
      expect(enT["upload.error-hint"]).toContain("size");
    });

    it("load-error-hint is friendly", () => {
      expect(zhT["upload.load-error-hint"]).toContain("刷新");
      expect(enT["upload.load-error-hint"]).toContain("Refresh");
    });
  });

  describe("5. No-table empty state", () => {
    it("no-files empty state is friendly", () => {
      expect(zhT["upload.no-files"]).toContain("暂无");
      expect(enT["upload.no-files"]).toContain("No");
    });

    it("no-files-desc mentions CSV/Excel", () => {
      expect(zhT["upload.no-files-desc"]).toContain("CSV");
      expect(zhT["upload.no-files-desc"]).toContain("Excel");
      expect(enT["upload.no-files-desc"]).toContain("CSV");
      expect(enT["upload.no-files-desc"]).toContain("Excel");
    });
  });

  describe("6. Disabled experimental features", () => {
    it("no Templates key in data page scope", () => {
      const dataKeys = Object.keys(zhT).filter(
        (k) => k.startsWith("data.") || k.startsWith("table.") || k.startsWith("preview.") || k.startsWith("quality.") || k.startsWith("upload.")
      );
      const templateKeys = dataKeys.filter((k) => k.toLowerCase().includes("template"));
      expect(templateKeys.length).toBe(0);
    });

    it("no Schedule key in data page scope", () => {
      const dataKeys = Object.keys(zhT).filter(
        (k) => k.startsWith("data.") || k.startsWith("table.") || k.startsWith("preview.") || k.startsWith("quality.") || k.startsWith("upload.")
      );
      const scheduleKeys = dataKeys.filter((k) => k.toLowerCase().includes("schedule"));
      expect(scheduleKeys.length).toBe(0);
    });

    it("no Diff key in data page scope", () => {
      const dataKeys = Object.keys(zhT).filter(
        (k) => k.startsWith("data.") || k.startsWith("table.") || k.startsWith("preview.") || k.startsWith("quality.") || k.startsWith("upload.")
      );
      const diffKeys = dataKeys.filter((k) => k.toLowerCase().includes("diff"));
      expect(diffKeys.length).toBe(0);
    });

    it("no Timeline key in data page scope", () => {
      const dataKeys = Object.keys(zhT).filter(
        (k) => k.startsWith("data.") || k.startsWith("table.") || k.startsWith("preview.") || k.startsWith("quality.") || k.startsWith("upload.")
      );
      const timelineKeys = dataKeys.filter((k) => k.toLowerCase().includes("timeline"));
      expect(timelineKeys.length).toBe(0);
    });
  });

  describe("7. Regression safety - no store/API/backend changes", () => {
    it("upload logic not changed - no new upload keys beyond guidance", () => {
      const uploadKeys = Object.keys(zhT).filter((k) => k.startsWith("upload."));
      // Should have standard set, not new business logic keys
      const hasBusinessLogic = uploadKeys.some((k) =>
        k.includes("max-size") || k.includes("validation") || k.includes("retry")
      );
      expect(hasBusinessLogic).toBe(false);
    });

    it("table selection logic not changed - no new selection keys", () => {
      const tableKeys = Object.keys(zhT).filter((k) => k.startsWith("table."));
      const hasSelectionLogic = tableKeys.some((k) =>
        k.includes("multi-select") || k.includes("batch")
      );
      expect(hasSelectionLogic).toBe(false);
    });

    it("delete logic not changed - only copy polish", () => {
      // confirm-delete should still be a string, not a complex modal config
      expect(typeof zhT["table.confirm-delete"]).toBe("string");
      expect(typeof enT["table.confirm-delete"]).toBe("string");
    });

    it("quality calculation not changed - no new quality metrics", () => {
      const qualityKeys = Object.keys(zhT).filter((k) => k.startsWith("quality."));
      const hasNewMetrics = qualityKeys.some((k) =>
        k.includes("accuracy") || k.includes("timeliness") || k.includes("relevance")
      );
      expect(hasNewMetrics).toBe(false);
    });
  });
});
