import { describe, it, expect } from "vitest";
import { runToMarkdown } from "../export-markdown";
import type { AnalysisRun } from "@/stores/analysis-store";
import type { MultiStepResult } from "@/services/api";

function makeRun(overrides: Partial<AnalysisRun> = {}): AnalysisRun {
  const multiResult: MultiStepResult = {
    question: "What are the top categories by revenue?",
    plan: [
      { step: 1, purpose: "Revenue by category", sql_goal: "Aggregate revenue", depends_on: null },
      { step: 2, purpose: "Top products", sql_goal: "Top products by revenue", depends_on: 1 },
    ],
    steps: [
      {
        step: 1,
        purpose: "Revenue by category",
        sql: "SELECT category, SUM(revenue) FROM sales GROUP BY category",
        columns: ["category", "revenue"],
        data: [],
        row_count: 3,
        status: "success",
      },
      {
        step: 2,
        purpose: "Top products",
        sql: "SELECT product, SUM(revenue) FROM sales GROUP BY product ORDER BY SUM(revenue) DESC LIMIT 10",
        columns: ["product", "revenue"],
        data: [],
        row_count: 10,
        status: "success",
      },
    ],
    summary: "Analysis complete.",
    status: "success",
  };

  return {
    id: "test-run-12345678",
    mode: "autonomous",
    question: "What are the top categories by revenue?",
    table: "sales",
    timestamp: "2026-06-22T10:30:00.000Z",
    status: "success",
    sections: [
      { title: "Executive Summary", content: "Revenue is dominated by electronics.", type: "markdown" },
      { title: "Key Findings", content: "- Electronics: 45%\n- Clothing: 30%\n- Food: 25%", type: "markdown" },
    ],
    chartSpecs: [],
    multiResult,
    trace: {
      trace_id: "trace-001",
      total_llm_calls: 3,
      total_input_tokens: 1500,
      total_output_tokens: 800,
      events: [],
      guardrail_violations: [],
    },
    saved: false,
    version: 1,
    ...overrides,
  };
}

describe("runToMarkdown", () => {
  it("should contain the question", () => {
    const md = runToMarkdown(makeRun());
    expect(md).toContain("What are the top categories by revenue?");
  });

  it("should contain the table name", () => {
    const md = runToMarkdown(makeRun());
    expect(md).toContain("sales");
  });

  it("should contain the executive summary", () => {
    const md = runToMarkdown(makeRun());
    expect(md).toContain("Revenue is dominated by electronics.");
  });

  it("should contain key findings", () => {
    const md = runToMarkdown(makeRun());
    expect(md).toContain("Electronics: 45%");
  });

  it("should contain analysis steps with SQL", () => {
    const md = runToMarkdown(makeRun());
    expect(md).toContain("Step 1");
    expect(md).toContain("Step 2");
    expect(md).toContain("```sql");
    expect(md).toContain("SELECT category, SUM(revenue)");
  });

  it("should contain step status and row count", () => {
    const md = runToMarkdown(makeRun());
    expect(md).toContain("状态：成功");
    expect(md).toContain("行数：3");
    expect(md).toContain("行数：10");
  });

  it("should contain trace summary", () => {
    const md = runToMarkdown(makeRun());
    expect(md).toContain("总 LLM 调用：3");
    expect(md).toContain("输入 Token：1500");
    expect(md).toContain("输出 Token：800");
  });

  it("should contain generation time", () => {
    const md = runToMarkdown(makeRun());
    expect(md).toContain("生成时间");
    expect(md).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/);
  });

  it("should start with the report title", () => {
    const md = runToMarkdown(makeRun());
    expect(md.startsWith("# AI 数据分析报告")).toBe(true);
  });

  it("should handle run without multiResult", () => {
    const md = runToMarkdown(makeRun({ multiResult: null }));
    expect(md).toContain("AI 数据分析报告");
    expect(md).not.toContain("分析步骤");
  });

  it("should handle run without trace", () => {
    const md = runToMarkdown(makeRun({ trace: null }));
    expect(md).toContain("AI 数据分析报告");
    expect(md).not.toContain("调用追踪");
  });

  it("should handle run without table", () => {
    const md = runToMarkdown(makeRun({ table: undefined }));
    expect(md).toContain("AI 数据分析报告");
    expect(md).not.toContain("## 数据表");
  });

  it("should handle error steps", () => {
    const run = makeRun({
      multiResult: {
        question: "test",
        plan: [],
        steps: [
          {
            step: 1,
            purpose: "Failed step",
            sql: "SELECT * FROM nonexistent",
            columns: [],
            data: [],
            row_count: 0,
            status: "error",
            error: "Table not found",
          },
        ],
        summary: "Partial failure.",
        status: "error",
      },
    });
    const md = runToMarkdown(run);
    expect(md).toContain("状态：失败");
    expect(md).toContain("错误：Table not found");
  });

  it("should not contain template or save-as-template text", () => {
    const md = runToMarkdown(makeRun());
    expect(md.toLowerCase()).not.toContain("save as template");
    expect(md.toLowerCase()).not.toContain("保存为模板");
  });

  it("should not contain 'Agent' in trace section", () => {
    const md = runToMarkdown(makeRun());
    // Trace section should use "追踪" not "Agent"
    expect(md).toContain("调用追踪");
    expect(md).not.toMatch(/## .*Agent/);
  });
});
