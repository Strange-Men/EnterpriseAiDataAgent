/**
 * Tests for export-markdown.ts
 *
 * Covers:
 * 1. Markdown 包含执行摘要
 * 2. Markdown 包含关键发现
 * 3. Markdown 包含最终结果章节
 * 4. Markdown 包含指标完成情况表
 * 5. 用户要求平均折扣但 SQL 没有 discount 时，报告标记未完成
 * 6. 用户要求退货率但 SQL 没有 is_returned 时，报告标记未完成
 * 7. 有 rows 时，最终结果表展示前 N 行
 * 8. 没有 rows 时，明确说明未保存完整结果行
 * 9. Trace 文案是 Trace / 调用追踪，不是 Agent
 * 10. SQL 放在 SQL 附录
 * 11. 生成时间是本地 24 小时制
 * 12. Markdown 不再只包含 SQL 和行数
 */

import { describe, it, expect } from "vitest";
import {
  runToMarkdown,
  extractRequestedMetrics,
  evaluateMetricCoverage,
  formatMarkdownTable,
  buildExecutiveSummary,
  buildKeyFindings,
} from "./export-markdown";
import type { AnalysisRun } from "@/stores/analysis-store";

// ── Helper to create mock run ──────────────────────────────────────

function createMockRun(overrides: Partial<AnalysisRun> = {}): AnalysisRun {
  return {
    id: "test-run-1",
    mode: "autonomous",
    question: "分析销售额",
    table: "sales",
    timestamp: "2026-06-22T10:30:00.000Z",
    status: "success",
    sections: [],
    chartSpecs: [],
    multiResult: null,
    trace: null,
    saved: false,
    version: 1,
    ...overrides,
  };
}

// ── extractRequestedMetrics ────────────────────────────────────────

describe("extractRequestedMetrics", () => {
  it("should extract total sales", () => {
    const result = extractRequestedMetrics("分析总销售额和订单数");
    expect(result).toContain("总销售额");
    expect(result).toContain("订单数");
  });

  it("should extract discount metrics", () => {
    const result = extractRequestedMetrics("计算平均折扣");
    expect(result).toContain("平均折扣");
  });

  it("should extract return rate", () => {
    const result = extractRequestedMetrics("分析退货率");
    expect(result).toContain("退货率");
  });

  it("should extract ranking", () => {
    const result = extractRequestedMetrics("按年份销售额排名前 5");
    expect(result).toContain("排名");
    expect(result).toContain("Top 5");
    expect(result).toContain("按年份");
  });

  it("should extract region", () => {
    const result = extractRequestedMetrics("按地区分析销售额占比");
    expect(result).toContain("按地区");
    expect(result).toContain("占比");
  });

  it("should return empty for no matching keywords", () => {
    const result = extractRequestedMetrics("查看数据表结构");
    expect(result).toEqual([]);
  });
});

// ── evaluateMetricCoverage ─────────────────────────────────────────

describe("evaluateMetricCoverage", () => {
  it("should mark discount as completed when SQL has AVG(discount)", () => {
    const sql = "SELECT AVG(discount) as avg_discount FROM sales";
    const coverage = evaluateMetricCoverage("计算平均折扣", sql);
    expect(coverage.length).toBe(1);
    expect(coverage[0].requirement).toBe("平均折扣");
    expect(coverage[0].completed).toBe(true);
  });

  it("should mark discount as NOT completed when SQL lacks discount", () => {
    const sql = "SELECT SUM(amount) as total FROM sales";
    const coverage = evaluateMetricCoverage("计算平均折扣", sql);
    expect(coverage.length).toBe(1);
    expect(coverage[0].requirement).toBe("平均折扣");
    expect(coverage[0].completed).toBe(false);
  });

  it("should mark return rate as NOT completed when SQL lacks return", () => {
    const sql = "SELECT SUM(amount) as total FROM sales";
    const coverage = evaluateMetricCoverage("分析退货率", sql);
    expect(coverage.length).toBe(1);
    expect(coverage[0].requirement).toBe("退货率");
    expect(coverage[0].completed).toBe(false);
  });

  it("should mark return rate as completed when SQL has return", () => {
    const sql = "SELECT COUNT(CASE WHEN is_returned = 1 THEN 1 END) / COUNT(*) as return_rate FROM sales";
    const coverage = evaluateMetricCoverage("分析退货率", sql);
    expect(coverage.length).toBe(1);
    expect(coverage[0].requirement).toBe("退货率");
    expect(coverage[0].completed).toBe(true);
  });

  it("should handle multiple metrics", () => {
    const sql = "SELECT SUM(amount) as total, COUNT(*) as order_count FROM sales";
    const coverage = evaluateMetricCoverage("总销售额和订单数", sql);
    // "总销售额" matches both "总销售额" and "销售额" keywords
    expect(coverage.length).toBeGreaterThanOrEqual(2);
    expect(coverage.find((c) => c.requirement === "总销售额")?.completed).toBe(true);
    expect(coverage.find((c) => c.requirement === "订单数")?.completed).toBe(true);
  });
});

// ── formatMarkdownTable ────────────────────────────────────────────

describe("formatMarkdownTable", () => {
  it("should format table with headers and rows", () => {
    const columns = ["name", "amount"];
    const data = [
      { name: "Alice", amount: 100 },
      { name: "Bob", amount: 200 },
    ];
    const result = formatMarkdownTable(columns, data);
    expect(result).toContain("| name | amount |");
    expect(result).toContain("| --- | --- |");
    expect(result).toContain("| Alice | 100 |");
    expect(result).toContain("| Bob | 200 |");
  });

  it("should limit rows to maxRows", () => {
    const columns = ["id"];
    const data = Array.from({ length: 30 }, (_, i) => ({ id: i }));
    const result = formatMarkdownTable(columns, data, 20);
    expect(result).toContain("显示前 20 行，共 30 行");
    expect(result).not.toContain("| 25 |");
  });

  it("should truncate long cell values", () => {
    const columns = ["text"];
    const data = [{ text: "a".repeat(100) }];
    const result = formatMarkdownTable(columns, data, 20, 50);
    expect(result).toContain("...");
  });

  it("should return empty string for empty data", () => {
    expect(formatMarkdownTable(["col"], [])).toBe("");
    expect(formatMarkdownTable([], [])).toBe("");
  });
});

// ── buildExecutiveSummary ──────────────────────────────────────────

describe("buildExecutiveSummary", () => {
  it("should use section summary if available", () => {
    const run = createMockRun({
      sections: [{ title: "Summary", content: "This is a summary.", type: "markdown" }],
    });
    expect(buildExecutiveSummary(run)).toBe("This is a summary.");
  });

  it("should use multiResult summary if available", () => {
    const run = createMockRun({
      multiResult: {
        question: "test",
        plan: [],
        steps: [],
        summary: "Multi-step summary.",
        status: "success",
      },
    });
    expect(buildExecutiveSummary(run)).toBe("Multi-step summary.");
  });

  it("should build from steps if no summary", () => {
    const run = createMockRun({
      multiResult: {
        question: "test",
        plan: [{ step: 1, purpose: "Analyze sales", sql_goal: "SELECT ...", depends_on: null }],
        steps: [
          { step: 1, purpose: "Analyze sales", sql: "SELECT 1", columns: [], data: [], row_count: 100, status: "success" },
        ],
        summary: "",
        status: "success",
      },
    });
    const summary = buildExecutiveSummary(run);
    expect(summary).toContain("1 个步骤");
    expect(summary).toContain("100 行");
  });

  it("should return fallback for empty run", () => {
    const run = createMockRun();
    const summary = buildExecutiveSummary(run);
    expect(summary).toContain("缺少足够的摘要信息");
  });
});

// ── buildKeyFindings ───────────────────────────────────────────────

describe("buildKeyFindings", () => {
  it("should use findings section if available", () => {
    const run = createMockRun({
      sections: [{ title: "Key Findings", content: "- Finding 1\n- Finding 2", type: "markdown" }],
    });
    const findings = buildKeyFindings(run);
    expect(findings).toContain("Finding 1");
    expect(findings).toContain("Finding 2");
  });

  it("should build from steps if no findings section", () => {
    const run = createMockRun({
      multiResult: {
        question: "test",
        plan: [],
        steps: [
          { step: 1, purpose: "Query data", sql: "SELECT 1", columns: [], data: [], row_count: 50, status: "success" },
        ],
        summary: "",
        status: "success",
      },
    });
    const findings = buildKeyFindings(run);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toContain("50 行");
  });

  it("should return fallback for empty run", () => {
    const run = createMockRun();
    const findings = buildKeyFindings(run);
    expect(findings[0]).toContain("未能生成可靠业务发现");
  });
});

// ── runToMarkdown ──────────────────────────────────────────────────

describe("runToMarkdown", () => {
  it("should include executive summary", () => {
    const run = createMockRun({
      sections: [{ title: "摘要", content: "测试摘要内容。", type: "markdown" }],
    });
    const md = runToMarkdown(run);
    expect(md).toContain("## 3. 执行摘要");
    expect(md).toContain("测试摘要内容。");
  });

  it("should include key findings", () => {
    const run = createMockRun({
      sections: [{ title: "发现", content: "- 发现 1\n- 发现 2", type: "markdown" }],
    });
    const md = runToMarkdown(run);
    expect(md).toContain("## 4. 关键发现");
    expect(md).toContain("发现 1");
  });

  it("should include final results section", () => {
    const run = createMockRun();
    const md = runToMarkdown(run);
    expect(md).toContain("## 5. 最终结果");
  });

  it("should include metric coverage table", () => {
    const run = createMockRun({
      question: "分析总销售额和平均折扣",
      multiResult: {
        question: "test",
        plan: [],
        steps: [
          { step: 1, purpose: "Query", sql: "SELECT SUM(amount) as total FROM sales", columns: ["total"], data: [{ total: 1000 }], row_count: 1, status: "success" },
        ],
        summary: "",
        status: "success",
      },
    });
    const md = runToMarkdown(run);
    expect(md).toContain("## 6. 指标完成情况");
    expect(md).toContain("| 用户要求 | 是否完成 |");
    expect(md).toContain("总销售额");
    expect(md).toContain("平均折扣");
  });

  it("should mark discount as NOT completed when SQL lacks discount", () => {
    const run = createMockRun({
      question: "计算平均折扣",
      multiResult: {
        question: "test",
        plan: [],
        steps: [
          { step: 1, purpose: "Query", sql: "SELECT SUM(amount) as total FROM sales", columns: ["total"], data: [{ total: 1000 }], row_count: 1, status: "success" },
        ],
        summary: "",
        status: "success",
      },
    });
    const md = runToMarkdown(run);
    expect(md).toContain("否");
    expect(md).toContain("SQL 中未包含");
  });

  it("should mark return rate as NOT completed when SQL lacks return", () => {
    const run = createMockRun({
      question: "分析退货率",
      multiResult: {
        question: "test",
        plan: [],
        steps: [
          { step: 1, purpose: "Query", sql: "SELECT SUM(amount) as total FROM sales", columns: ["total"], data: [{ total: 1000 }], row_count: 1, status: "success" },
        ],
        summary: "",
        status: "success",
      },
    });
    const md = runToMarkdown(run);
    expect(md).toContain("否");
    expect(md).toContain("退货");
  });

  it("should show final result table when rows exist", () => {
    const run = createMockRun({
      multiResult: {
        question: "test",
        plan: [],
        steps: [
          {
            step: 1,
            purpose: "Query",
            sql: "SELECT region, amount FROM sales",
            columns: ["region", "amount"],
            data: [
              { region: "East", amount: 100 },
              { region: "West", amount: 200 },
            ],
            row_count: 2,
            status: "success",
          },
        ],
        summary: "",
        status: "success",
      },
    });
    const md = runToMarkdown(run);
    expect(md).toContain("| region | amount |");
    expect(md).toContain("| East | 100 |");
    expect(md).toContain("| West | 200 |");
  });

  it("should show message when rows not persisted", () => {
    const run = createMockRun({
      multiResult: {
        question: "test",
        plan: [],
        steps: [
          {
            step: 1,
            purpose: "Query",
            sql: "SELECT * FROM sales",
            columns: [],
            data: [],
            row_count: 100,
            status: "success",
          },
        ],
        summary: "",
        status: "success",
      },
    });
    const md = runToMarkdown(run);
    expect(md).toContain("当前记录未保存完整结果行");
  });

  it("should show empty result message when no rows", () => {
    const run = createMockRun({
      multiResult: {
        question: "test",
        plan: [],
        steps: [
          {
            step: 1,
            purpose: "Query",
            sql: "SELECT * FROM empty_table",
            columns: ["col"],
            data: [],
            row_count: 0,
            status: "success",
          },
        ],
        summary: "",
        status: "success",
      },
    });
    const md = runToMarkdown(run);
    expect(md).toContain("当前查询结果为空");
  });

  it("should put SQL in appendix, not inline in steps", () => {
    const run = createMockRun({
      multiResult: {
        question: "test",
        plan: [],
        steps: [
          { step: 1, purpose: "Query", sql: "SELECT 1", columns: [], data: [], row_count: 1, status: "success" },
        ],
        summary: "",
        status: "success",
      },
    });
    const md = runToMarkdown(run);
    // SQL should be in appendix
    expect(md).toContain("## 9. SQL 附录");
    expect(md).toContain("```sql");
    // Step section should not contain SQL inline
    const stepSection = md.split("## 8. 分析步骤")[1]?.split("## 9. SQL 附录")[0] || "";
    expect(stepSection).not.toContain("```sql");
  });

  it("should use Trace / 调用追踪, not Agent", () => {
    const run = createMockRun({
      trace: {
        trace_id: "test-trace",
        total_llm_calls: 3,
        total_input_tokens: 1000,
        total_output_tokens: 500,
        events: [
          { timestamp: "2026-06-22T10:30:00.000Z", operation: "llm_call", phase: "analysis", prompt_name: "test", input_tokens: 500, output_tokens: 250, latency_ms: 1000, status: "success" },
          { timestamp: "2026-06-22T10:30:01.000Z", operation: "llm_call", phase: "analysis", prompt_name: "test", input_tokens: 500, output_tokens: 250, latency_ms: 1500, status: "success" },
        ],
        guardrail_violations: [],
      },
    });
    const md = runToMarkdown(run);
    expect(md).toContain("## 10. 调用追踪 Trace");
    expect(md).not.toContain("Agent");
    expect(md).toContain("LLM 调用次数");
    expect(md).toContain("总耗时");
  });

  it("should include generation time in 24h format", () => {
    const run = createMockRun({
      timestamp: "2026-06-22T14:30:00.000Z",
    });
    const md = runToMarkdown(run);
    expect(md).toContain("## 11. 生成时间");
    // Should contain HH:mm format (24h)
    expect(md).toMatch(/\d{2}:\d{2}/);
  });

  it("should not be just SQL and row count", () => {
    const run = createMockRun({
      question: "分析销售额",
      multiResult: {
        question: "test",
        plan: [],
        steps: [
          { step: 1, purpose: "Query", sql: "SELECT SUM(amount) FROM sales", columns: ["total"], data: [{ total: 1000 }], row_count: 1, status: "success" },
        ],
        summary: "销售额分析完成",
        status: "success",
      },
    });
    const md = runToMarkdown(run);
    // Should have multiple sections
    expect(md).toContain("## 1. 用户问题");
    expect(md).toContain("## 3. 执行摘要");
    expect(md).toContain("## 4. 关键发现");
    expect(md).toContain("## 5. 最终结果");
    expect(md).toContain("## 6. 指标完成情况");
    expect(md).toContain("## 7. 未满足项");
    expect(md).toContain("## 8. 分析步骤");
    expect(md).toContain("## 9. SQL 附录");
  });
});
