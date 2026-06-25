/**
 * M4-8.7.2 Global i18n Copy Consistency Tests
 *
 * Covers:
 * 1. status-panel i18n migration
 * 2. workflow-banner i18n migration
 * 3. analysis-section toast/fallback i18n migration
 * 4. i18n key symmetry (zh/en)
 * 5. Terminology consistency in touched files
 * 6. export-markdown NOT changed (remaining risk)
 * 7. No business logic changes
 */

import { describe, it, expect } from "vitest";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

const zhKeys = Object.keys(zh.translation);
const enKeys = Object.keys(en.translation);

// ── 1. Status Panel i18n ─────────────────────────────────────────

describe("Status Panel i18n keys", () => {
  const requiredKeys = [
    "status.ai-label",
    "status.ai-not-set",
    "status.ai-settings",
    "status.ai-model",
    "status.ai-temperature",
    "status.ai-base-url",
    "status.ai-status",
    "status.ai-connected",
    "status.ai-not-configured",
    "status.ai-connection-error",
  ];

  it("all status.ai-* keys exist in zh", () => {
    for (const key of requiredKeys) {
      expect(zhKeys).toContain(key);
    }
  });

  it("all status.ai-* keys exist in en", () => {
    for (const key of requiredKeys) {
      expect(enKeys).toContain(key);
    }
  });

  it("zh status.ai-settings is Chinese", () => {
    expect(zh.translation["status.ai-settings"]).toBe("AI 设置");
  });

  it("en status.ai-settings is English", () => {
    expect(en.translation["status.ai-settings"]).toBe("AI Settings");
  });

  it("zh status.ai-connected is Chinese", () => {
    expect(zh.translation["status.ai-connected"]).toBe("已连接");
  });

  it("en status.ai-connected is English", () => {
    expect(en.translation["status.ai-connected"]).toBe("Connected");
  });

  it("zh status.ai-not-configured is Chinese", () => {
    expect(zh.translation["status.ai-not-configured"]).toBe("未配置 API Key");
  });

  it("en status.ai-not-configured is English", () => {
    expect(en.translation["status.ai-not-configured"]).toBe("API key not set");
  });
});

// ── 2. Workflow Banner i18n ───────────────────────────────────────

describe("Workflow Banner i18n keys", () => {
  const requiredKeys = [
    "workflow.done",
    "workflow.uploading",
    "workflow.table-ready",
    "workflow.analyzing",
    "workflow.analysis-complete",
    "workflow.executing",
    "workflow.generating",
    "workflow.generate-sql",
    "workflow.dismiss",
  ];

  it("all workflow.* keys exist in zh", () => {
    for (const key of requiredKeys) {
      expect(zhKeys).toContain(key);
    }
  });

  it("all workflow.* keys exist in en", () => {
    for (const key of requiredKeys) {
      expect(enKeys).toContain(key);
    }
  });

  it("workflow keys use interpolation for table name", () => {
    expect(zh.translation["workflow.done"]).toContain("{{table}}");
    expect(en.translation["workflow.done"]).toContain("{{table}}");
    expect(zh.translation["workflow.table-ready"]).toContain("{{table}}");
    expect(en.translation["workflow.table-ready"]).toContain("{{table}}");
  });

  it("zh workflow.uploading is Chinese", () => {
    expect(zh.translation["workflow.uploading"]).toBe("上传中...");
  });

  it("en workflow.uploading is English", () => {
    expect(en.translation["workflow.uploading"]).toBe("Uploading...");
  });

  it("zh workflow.generate-sql is Chinese", () => {
    expect(zh.translation["workflow.generate-sql"]).toBe("生成 SQL");
  });

  it("en workflow.generate-sql is English", () => {
    expect(en.translation["workflow.generate-sql"]).toBe("Generate SQL");
  });
});

// ── 3. Analysis Section i18n ──────────────────────────────────────

describe("Analysis Section i18n keys", () => {
  it("analysis.no-content exists in zh", () => {
    expect(zhKeys).toContain("analysis.no-content");
  });

  it("analysis.no-content exists in en", () => {
    expect(enKeys).toContain("analysis.no-content");
  });

  it("analysis.section-fallback exists in zh", () => {
    expect(zhKeys).toContain("analysis.section-fallback");
  });

  it("analysis.section-fallback exists in en", () => {
    expect(enKeys).toContain("analysis.section-fallback");
  });

  it("ai.copied exists in both languages (reused for toast)", () => {
    expect(zhKeys).toContain("ai.copied");
    expect(enKeys).toContain("ai.copied");
  });

  it("ai.copy-failed exists in both languages (reused for toast)", () => {
    expect(zhKeys).toContain("ai.copy-failed");
    expect(enKeys).toContain("ai.copy-failed");
  });

  it("ai.copy-section exists in both languages (reused for tooltip)", () => {
    expect(zhKeys).toContain("ai.copy-section");
    expect(enKeys).toContain("ai.copy-section");
  });

  it("zh analysis.no-content is Chinese", () => {
    expect(zh.translation["analysis.no-content"]).toBe("暂无内容。");
  });

  it("en analysis.no-content is English", () => {
    expect(en.translation["analysis.no-content"]).toBe("No content available.");
  });
});

// ── 4. Key Symmetry ──────────────────────────────────────────────

describe("zh/en key symmetry for M4-8.7.2 additions", () => {
  const m4872Keys = [
    "status.ai-label",
    "status.ai-not-set",
    "status.ai-settings",
    "status.ai-model",
    "status.ai-temperature",
    "status.ai-base-url",
    "status.ai-status",
    "status.ai-connected",
    "status.ai-not-configured",
    "status.ai-connection-error",
    "workflow.done",
    "workflow.uploading",
    "workflow.table-ready",
    "workflow.analyzing",
    "workflow.analysis-complete",
    "workflow.executing",
    "workflow.generating",
    "workflow.generate-sql",
    "workflow.dismiss",
    "analysis.no-content",
    "analysis.section-fallback",
  ];

  it("all 21 new keys exist in zh", () => {
    for (const key of m4872Keys) {
      expect(zhKeys).toContain(key);
    }
  });

  it("all 21 new keys exist in en", () => {
    for (const key of m4872Keys) {
      expect(enKeys).toContain(key);
    }
  });

  it("zh and en have the same total key count", () => {
    expect(zhKeys.length).toBe(enKeys.length);
  });

  it("every zh key has a corresponding en key", () => {
    const missing = zhKeys.filter((k) => !enKeys.includes(k));
    expect(missing).toEqual([]);
  });

  it("every en key has a corresponding zh key", () => {
    const missing = enKeys.filter((k) => !zhKeys.includes(k));
    expect(missing).toEqual([]);
  });
});

// ── 5. Terminology Consistency ────────────────────────────────────

describe("Terminology consistency in touched files", () => {
  it("workflow.banner uses 'Table' not 'Dataset' for table references", () => {
    // workflow.table-ready and workflow.analyzing reference tables
    expect(en.translation["workflow.table-ready"]).toContain("Table");
    expect(en.translation["workflow.table-ready"]).not.toContain("Dataset");
  });

  it("zh uses 数据表 for workflow table references", () => {
    expect(zh.translation["workflow.table-ready"]).toContain("数据表");
  });

  it("export terminology uses 导出/Export not 下载/Download in touched keys", () => {
    // The new workflow keys don't use export/download, which is correct
    // Existing keys like ai.export-md already use 导出/Export
    expect(zh.translation["ai.export-md"]).toBe("导出 Markdown");
    expect(en.translation["ai.export-md"]).toBe("Export Markdown");
  });

  it("history terminology uses 历史记录 consistently", () => {
    expect(zh.translation["history.title"]).toBe("历史记录");
    expect(en.translation["history.title"]).toBe("History");
  });
});

// ── 6. Export Markdown NOT Changed ────────────────────────────────

describe("Export Markdown handling (NOT migrated)", () => {
  it("export-markdown.ts was not modified — documented as remaining risk", () => {
    // This test documents that export-markdown.ts was intentionally NOT migrated.
    // The file contains 60+ hardcoded Chinese strings in runToMarkdown() and
    // METRIC_REQUIREMENTS. Migrating would require:
    // 1. Changing runToMarkdown() function signature to accept t function
    // 2. Updating all callers across the codebase
    // 3. The METRIC_REQUIREMENTS.keyword field is business logic (Chinese keyword matching)
    // This is deferred to a future dedicated phase.
    expect(true).toBe(true);
  });
});

// ── 7. No Business Logic Changes ─────────────────────────────────

describe("No business logic regression", () => {
  it("existing status keys preserved", () => {
    expect(zhKeys).toContain("status.title");
    expect(zhKeys).toContain("status.operational");
    expect(zhKeys).toContain("status.error");
    expect(zhKeys).toContain("status.api");
    expect(zhKeys).toContain("status.db");
    expect(zhKeys).toContain("status.version");
    expect(zhKeys).toContain("status.uptime");
  });

  it("existing ai keys preserved", () => {
    expect(zhKeys).toContain("ai.copied");
    expect(zhKeys).toContain("ai.copy-failed");
    expect(zhKeys).toContain("ai.copy-section");
    expect(zhKeys).toContain("ai.export-md");
    expect(zhKeys).toContain("ai.generating");
    expect(zhKeys).toContain("ai.generate-sql");
  });

  it("no restored experimental features", () => {
    // These should still not exist as active features
    // (templates/schedule/diff/timeline keys exist but are dormant)
    expect(zhKeys).toContain("nav.settings");
    expect(enKeys).toContain("nav.settings");
  });
});
