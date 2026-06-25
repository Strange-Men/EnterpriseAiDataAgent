/**
 * M4-8.6.4 Delete / Empty / Error State Polish
 *
 * 验证 Data Page 的删除、空态、错误态文案和展示符合产品化要求。
 * 不验证业务逻辑（删除 handler、上传 handler、Store 行为、API 调用）。
 */
import { describe, it, expect } from "vitest";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

const zhT = zh.translation;
const enT = en.translation;

describe("M4-8.6.4 — Delete / Empty / Error State Polish", () => {
  // ── Delete Button ──

  it("table.delete key exists in zh and en", () => {
    expect(zhT["table.delete"]).toBeTruthy();
    expect(enT["table.delete"]).toBeTruthy();
  });

  it("table.delete-aria key exists for accessibility", () => {
    expect(zhT["table.delete-aria"]).toBeTruthy();
    expect(enT["table.delete-aria"]).toBeTruthy();
    expect(zhT["table.delete-aria"]).toContain("删除");
    expect(enT["table.delete-aria"]).toContain("Delete");
  });

  it("delete button is not the primary visual — key exists and is lowercase icon (×)", () => {
    // The delete button uses × character, not a prominent label
    // Just verify the aria-label key exists so screen readers can describe it
    expect(zhT["table.delete-aria"]).toBeTruthy();
    expect(enT["table.delete-aria"]).toBeTruthy();
  });

  // ── Delete Confirm Copy ──

  it("confirm-delete mentions impact on history records (zh)", () => {
    const msg = zhT["table.confirm-delete"];
    expect(msg).toContain("历史记录");
    expect(msg).toContain("删除");
  });

  it("confirm-delete mentions impact on history records (en)", () => {
    const msg = enT["table.confirm-delete"];
    expect(msg.toLowerCase()).toContain("history");
    expect(msg.toLowerCase()).toContain("delete");
  });

  it("confirm-delete does NOT use the old short format", () => {
    // Old: "确认删除表" — New should be a full sentence
    expect(zhT["table.confirm-delete"].length).toBeGreaterThan(15);
    expect(enT["table.confirm-delete"].length).toBeGreaterThan(20);
  });

  // ── Delete Success / Error Copy ──

  it("table.delete-success key exists with interpolation", () => {
    expect(zhT["table.delete-success"]).toContain("{{name}}");
    expect(enT["table.delete-success"]).toContain("{{name}}");
  });

  it("table.delete-failed key exists and is friendly", () => {
    expect(zhT["table.delete-failed"]).toBeTruthy();
    expect(enT["table.delete-failed"]).toBeTruthy();
    // Should suggest refresh, not just "error"
    expect(zhT["table.delete-failed"]).toContain("刷新");
    expect(enT["table.delete-failed"]).toContain("refresh");
  });

  // ── No Table Empty State ──

  it("table.no-tables is user-friendly (zh)", () => {
    expect(zhT["table.no-tables"]).toBeTruthy();
    // Should not be too technical
    expect(zhT["table.no-tables"]).not.toContain("数据库");
  });

  it("table.no-tables is user-friendly (en)", () => {
    expect(enT["table.no-tables"]).toBeTruthy();
    expect(enT["table.no-tables"]).not.toContain("database");
  });

  it("table.no-tables-desc guides next action (zh)", () => {
    expect(zhT["table.no-tables-desc"]).toContain("上传");
  });

  it("table.no-tables-desc guides next action (en)", () => {
    expect(enT["table.no-tables-desc"]).toContain("uploading");
  });

  // ── No Preview Empty State ──

  it("preview.no-table-selected exists for when no table is active (zh)", () => {
    expect(zhT["preview.no-table-selected"]).toBeTruthy();
    expect(zhT["preview.no-table-selected"]).toContain("预览");
  });

  it("preview.no-table-selected exists for when no table is active (en)", () => {
    expect(enT["preview.no-table-selected"]).toBeTruthy();
    expect(enT["preview.no-table-selected"]).toContain("preview");
  });

  it("preview.no-table-selected-desc guides user to select a table (zh)", () => {
    expect(zhT["preview.no-table-selected-desc"]).toContain("选择");
    expect(zhT["preview.no-table-selected-desc"]).toContain("数据表");
  });

  it("preview.no-table-selected-desc guides user to select a table (en)", () => {
    expect(enT["preview.no-table-selected-desc"]).toContain("table");
    expect(enT["preview.no-table-selected-desc"]).toContain("Choose");
  });

  it("preview.no-data-loaded still exists for backward compat", () => {
    expect(zhT["preview.no-data-loaded"]).toBeTruthy();
    expect(enT["preview.no-data-loaded"]).toBeTruthy();
  });

  // ── Upload Error State ──

  it("upload.error-hint exists and is friendly (zh)", () => {
    expect(zhT["upload.error-hint"]).toBeTruthy();
    expect(zhT["upload.error-hint"]).toContain("格式");
    expect(zhT["upload.error-hint"]).toContain("重试");
  });

  it("upload.error-hint exists and is friendly (en)", () => {
    expect(enT["upload.error-hint"]).toBeTruthy();
    expect(enT["upload.error-hint"]).toContain("format");
    expect(enT["upload.error-hint"]).toContain("try again");
  });

  // ── Load Error State ──

  it("upload.load-error-hint exists and is friendly (zh)", () => {
    expect(zhT["upload.load-error-hint"]).toBeTruthy();
    expect(zhT["upload.load-error-hint"]).toContain("刷新");
  });

  it("upload.load-error-hint exists and is friendly (en)", () => {
    expect(enT["upload.load-error-hint"]).toBeTruthy();
    expect(enT["upload.load-error-hint"]).toContain("Refresh");
  });

  // ── Existing Keys Preserved ──

  it("existing table keys are preserved", () => {
    expect(zhT["table.management"]).toBeTruthy();
    expect(zhT["table.refresh"]).toBeTruthy();
    expect(zhT["table.query"]).toBeTruthy();
    expect(zhT["table.rename"]).toBeTruthy();
    expect(zhT["table.export"]).toBeTruthy();
    expect(zhT["table.confirm"]).toBeTruthy();
    expect(zhT["table.cancel"]).toBeTruthy();
  });

  it("existing preview keys are preserved", () => {
    expect(zhT["preview.title"]).toBeTruthy();
    expect(zhT["preview.description"]).toBeTruthy();
    expect(zhT["preview.tab-preview"]).toBeTruthy();
    expect(zhT["preview.tab-schema"]).toBeTruthy();
    expect(zhT["preview.tab-quality"]).toBeTruthy();
    expect(zhT["preview.start-analysis"]).toBeTruthy();
  });

  it("existing upload keys are preserved", () => {
    expect(zhT["upload.dropzone"]).toBeTruthy();
    expect(zhT["upload.formats"]).toBeTruthy();
    expect(zhT["upload.guidance"]).toBeTruthy();
    expect(zhT["upload.flow"]).toBeTruthy();
  });

  // ── Not Restoring Deleted Features ──

  it("does NOT restore Templates / Schedule / Diff / Timeline keys that were removed", () => {
    // These keys exist in the i18n files but their panels are not restored
    // Just verify we didn't add new panel-level keys for these features
    const newKeys = Object.keys(zhT).filter(
      (k) =>
        k.startsWith("template.panel") ||
        k.startsWith("schedule.panel") ||
        k.startsWith("diff.panel") ||
        k.startsWith("timeline.panel")
    );
    expect(newKeys).toHaveLength(0);
  });

  // ── New Keys Namespace ──

  it("all new M4-8.6.4 keys are in expected namespaces", () => {
    const m4864Keys = [
      "table.delete-aria",
      "table.delete-success",
      "table.delete-failed",
      "preview.no-table-selected",
      "preview.no-table-selected-desc",
      "upload.error-hint",
      "upload.load-error-hint",
    ];
    for (const key of m4864Keys) {
      expect(zhT[key as keyof typeof zhT]).toBeTruthy();
      expect(enT[key as keyof typeof enT]).toBeTruthy();
    }
  });
});
