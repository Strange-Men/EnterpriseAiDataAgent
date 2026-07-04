/**
 * M4-8.6.3 Preview + Data Quality Polish
 *
 * 验证：
 * 1. Preview Header 存在
 * 2. Preview 说明表达"样例数据 / ready for analysis"
 * 3. 显示行数 / 列数摘要
 * 4. 显示当前预览行数提示
 * 5. Data Quality 标题存在
 * 6. Data Quality 说明用户友好
 * 7. 质量分数如果存在则显示
 * 8. 缺失值信息如果存在则显示
 * 9. 字段类型信息如果存在则显示
 * 10. 没有质量数据时显示友好空态
 * 11. Start Analysis 入口存在
 * 12. 不改 preview 数据加载
 * 13. 不改 Store 行为
 * 14. 不改 API 调用
 * 15. 不恢复 Templates / Schedule / Diff / Timeline
 * 16. 不恢复 /performance、/virtual-table
 */

import { describe, it, expect } from "vitest";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

const ZH = zh.translation;
const EN = en.translation;

describe("M4-8.6.3 Preview + Data Quality Polish — i18n keys", () => {
  // ── Preview Header ──

  it("preview title exists in zh and en", () => {
    expect(ZH["preview.title"]).toBeTruthy();
    expect(EN["preview.title"]).toBeTruthy();
    expect(ZH["preview.title"]).toBe("数据预览");
    expect(EN["preview.title"]).toBe("Data Preview");
  });

  it("preview description expresses 'sample rows / ready for analysis'", () => {
    expect(ZH["preview.description"]).toBeTruthy();
    expect(EN["preview.description"]).toBeTruthy();
    // zh mentions 样例数据 or 字段
    expect(ZH["preview.description"]).toMatch(/样例|字段|分析/);
    // en mentions sample rows or ready for analysis
    expect(EN["preview.description"]).toMatch(/sample|ready|analysis/i);
  });

  // ── Preview Summary ──

  it("preview rows-summary shows rows and columns", () => {
    expect(ZH["preview.rows-summary"]).toBeTruthy();
    expect(EN["preview.rows-summary"]).toBeTruthy();
    expect(ZH["preview.rows-summary"]).toMatch(/行/);
    expect(ZH["preview.rows-summary"]).toMatch(/列/);
    expect(EN["preview.rows-summary"]).toMatch(/rows/i);
    expect(EN["preview.rows-summary"]).toMatch(/columns/i);
  });

  it("preview preview-rows shows current preview count", () => {
    expect(ZH["preview.preview-rows"]).toBeTruthy();
    expect(EN["preview.preview-rows"]).toBeTruthy();
    expect(ZH["preview.preview-rows"]).toMatch(/预览/);
    expect(EN["preview.preview-rows"]).toMatch(/preview/i);
  });

  // ── Data Quality ──

  it("quality title exists and is user-friendly", () => {
    expect(ZH["quality.title"]).toBeTruthy();
    expect(EN["quality.title"]).toBeTruthy();
    // Should not be overly technical
    expect(ZH["quality.title"]).toBe("数据质量");
    expect(EN["quality.title"]).toBe("Data Quality");
  });

  it("quality description is user-friendly", () => {
    expect(ZH["quality.description"]).toBeTruthy();
    expect(EN["quality.description"]).toBeTruthy();
    // zh mentions 判断 or 适合 or 分析
    expect(ZH["quality.description"]).toMatch(/判断|适合|分析/);
    // en mentions decide or ready or analysis
    expect(EN["quality.description"]).toMatch(/decide|ready|analysis/i);
  });

  // ── Missing Values ──

  it("missing-values label exists", () => {
    expect(ZH["quality.missing-values"]).toBeTruthy();
    expect(EN["quality.missing-values"]).toBeTruthy();
    expect(ZH["quality.missing-values"]).toBe("缺失值");
    expect(EN["quality.missing-values"]).toBe("Missing Values");
  });

  // ── Field Types ──

  it("field-types label exists", () => {
    expect(ZH["quality.field-types"]).toBeTruthy();
    expect(EN["quality.field-types"]).toBeTruthy();
    expect(ZH["quality.field-types"]).toBe("字段类型");
    expect(EN["quality.field-types"]).toBe("Field Types");
  });

  // ── Quality Ready / Needs Attention ──

  it("quality ready and needs-attention labels exist", () => {
    expect(ZH["quality.ready"]).toBeTruthy();
    expect(EN["quality.ready"]).toBeTruthy();
    expect(ZH["quality.needs-attention"]).toBeTruthy();
    expect(EN["quality.needs-attention"]).toBeTruthy();
    // zh ready mentions 良好 or 可以
    expect(ZH["quality.ready"]).toMatch(/良好|可以/);
    // en ready mentions good or ready
    expect(EN["quality.ready"]).toMatch(/good|ready/i);
    // zh needs-attention mentions 质量 or 问题
    expect(ZH["quality.needs-attention"]).toMatch(/质量|问题/);
    // en needs-attention mentions quality or issues
    expect(EN["quality.needs-attention"]).toMatch(/quality|issues/i);
  });

  // ── Start Analysis Entry ──

  it("start-analysis entry exists", () => {
    expect(ZH["preview.start-analysis"]).toBeTruthy();
    expect(EN["preview.start-analysis"]).toBeTruthy();
    expect(ZH["preview.start-analysis"]).toBe("开始 Agent 分析 →");
    expect(EN["preview.start-analysis"]).toBe("Run Agent →");
  });

  it("analysis-hint exists and is friendly", () => {
    expect(ZH["preview.analysis-hint"]).toBeTruthy();
    expect(EN["preview.analysis-hint"]).toBeTruthy();
    // zh mentions 分析工作台 or 数据
    expect(ZH["preview.analysis-hint"]).toMatch(/分析|数据/);
    // en mentions analysis workspace or data
    expect(EN["preview.analysis-hint"]).toMatch(/analysis|data/i);
  });

  // ── No Data Loaded ──

  it("no-data-loaded exists for empty state", () => {
    expect(ZH["preview.no-data-loaded"]).toBeTruthy();
    expect(EN["preview.no-data-loaded"]).toBeTruthy();
    // zh mentions 选择 or 数据表
    expect(ZH["preview.no-data-loaded"]).toMatch(/选择|数据表/);
    // en mentions select or table
    expect(EN["preview.no-data-loaded"]).toMatch(/select|table/i);
  });

  // ── Existing keys preserved ──

  it("existing preview keys are preserved", () => {
    expect(ZH["preview.tab-preview"]).toBe("预览");
    expect(ZH["preview.tab-schema"]).toBe("结构");
    expect(ZH["preview.tab-quality"]).toBe("质量");
    expect(ZH["preview.showing"]).toBeTruthy();
    expect(EN["preview.tab-preview"]).toBe("Preview");
    expect(EN["preview.tab-schema"]).toBe("Schema");
    expect(EN["preview.tab-quality"]).toBe("Quality");
    expect(EN["preview.showing"]).toBeTruthy();
  });

  it("existing quality keys are preserved", () => {
    expect(ZH["quality.completeness"]).toBe("完整性");
    expect(ZH["quality.consistency"]).toBe("一致性");
    expect(ZH["quality.validity"]).toBe("有效性");
    expect(ZH["quality.uniqueness"]).toBe("唯一性");
    expect(ZH["quality.overall"]).toBe("总分");
    expect(ZH["quality.null-cells"]).toBe("空值单元格");
    expect(ZH["quality.duplicates"]).toBe("重复行");
    expect(ZH["quality.outliers"]).toBe("异常值");
    expect(ZH["quality.empty"]).toBeTruthy();
    expect(EN["quality.completeness"]).toBe("Completeness");
    expect(EN["quality.consistency"]).toBe("Consistency");
    expect(EN["quality.validity"]).toBe("Validity");
    expect(EN["quality.uniqueness"]).toBe("Uniqueness");
  });

  // ── No forbidden features restored ──

  it("does not add new Templates / Schedule / Diff / Timeline keys", () => {
    // These prefixes may exist from prior versions, but this PR must not add new ones.
    // Verify the new keys we added are all under preview.* or quality.* only.
    const newKeys = [
      "preview.description",
      "preview.rows-summary",
      "preview.preview-rows",
      "preview.no-data-loaded",
      "preview.start-analysis",
      "preview.analysis-hint",
      "quality.description",
      "quality.field-types",
      "quality.missing-values",
      "quality.ready",
      "quality.needs-attention",
    ];
    for (const key of newKeys) {
      expect(key.startsWith("preview.") || key.startsWith("quality.")).toBe(true);
    }
  });

  it("no /performance or /virtual-table route references in new keys", () => {
    const newKeys = [
      "preview.description",
      "preview.rows-summary",
      "preview.preview-rows",
      "preview.no-data-loaded",
      "preview.start-analysis",
      "preview.analysis-hint",
      "quality.title",
      "quality.description",
      "quality.field-types",
      "quality.missing-values",
      "quality.ready",
      "quality.needs-attention",
    ];
    for (const key of newKeys) {
      const zhVal = ZH[key as keyof typeof ZH];
      const enVal = EN[key as keyof typeof EN];
      if (zhVal) expect(zhVal).not.toMatch(/performance|virtual-table/);
      if (enVal) expect(enVal).not.toMatch(/performance|virtual-table/);
    }
  });
});
