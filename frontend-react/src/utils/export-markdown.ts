/**
 * Markdown export utility for AI analysis reports.
 *
 * Generates a structured markdown document from an AnalysisRun,
 * suitable for sharing with non-technical stakeholders.
 *
 * Report structure:
 * 1. 用户问题
 * 2. 数据表
 * 3. 执行摘要
 * 4. 关键发现
 * 5. 最终结果表
 * 6. 指标完成情况
 * 7. 未满足项 / 缺失字段说明
 * 8. 分析步骤
 * 9. SQL 附录
 * 10. 调用追踪 Trace
 * 11. 生成时间
 */

import type { AnalysisRun } from "@/stores/analysis-store";
import { formatLocalDateTime } from "@/utils/datetime";

// ── Metric extraction ──────────────────────────────────────────────

interface MetricRequirement {
  keyword: string;
  label: string;
  sqlPatterns: string[];
  description: string;
}

const METRIC_REQUIREMENTS: MetricRequirement[] = [
  {
    keyword: "总销售额",
    label: "总销售额",
    sqlPatterns: ["SUM(", "sum(", "total_sales", "sales_amount"],
    description: "SUM(sales) 或类似聚合",
  },
  {
    keyword: "销售额",
    label: "销售额",
    sqlPatterns: ["sales", "amount", "revenue"],
    description: "销售额字段",
  },
  {
    keyword: "订单记录数",
    label: "订单记录数",
    sqlPatterns: ["COUNT(", "count(", "order_id", "order_count"],
    description: "COUNT(*) 或 COUNT(order_id)",
  },
  {
    keyword: "订单数",
    label: "订单数",
    sqlPatterns: ["COUNT(", "count(", "order_id", "order_count"],
    description: "COUNT(*) 或 COUNT(order_id)",
  },
  {
    keyword: "平均折扣",
    label: "平均折扣",
    sqlPatterns: ["AVG(", "avg(", "discount"],
    description: "AVG(discount) 或类似",
  },
  {
    keyword: "折扣",
    label: "平均折扣",
    sqlPatterns: ["AVG(", "avg(", "discount"],
    description: "AVG(discount) 或类似",
  },
  {
    keyword: "退货率",
    label: "退货率",
    sqlPatterns: ["return", "is_returned", "refund"],
    description: "退货相关字段或计算",
  },
  {
    keyword: "退货",
    label: "退货率",
    sqlPatterns: ["return", "is_returned", "refund"],
    description: "退货相关字段或计算",
  },
  {
    keyword: "客单价",
    label: "客单价",
    sqlPatterns: ["AVG(", "avg(", "per_order", "avg_order"],
    description: "总销售额 / 订单数",
  },
  {
    keyword: "销售额占比",
    label: "销售额占比",
    sqlPatterns: ["SUM(", "sum(", "OVER(", "over(", "PARTITION", "partition"],
    description: "窗口函数或子查询计算占比",
  },
  {
    keyword: "占比",
    label: "占比",
    sqlPatterns: ["SUM(", "sum(", "OVER(", "over(", "PARTITION", "partition"],
    description: "窗口函数或子查询计算占比",
  },
  {
    keyword: "比例",
    label: "占比",
    sqlPatterns: ["SUM(", "sum(", "OVER(", "over(", "PARTITION", "partition"],
    description: "窗口函数或子查询计算占比",
  },
  {
    keyword: "同比增长率",
    label: "同比增长率",
    sqlPatterns: ["LAG(", "lag(", "YoY", "yoy", "growth", "同比"],
    description: "LAG() 或同比计算",
  },
  {
    keyword: "同比",
    label: "同比增长率",
    sqlPatterns: ["LAG(", "lag(", "YoY", "yoy", "growth", "同比"],
    description: "LAG() 或同比计算",
  },
  {
    keyword: "排名",
    label: "排名",
    sqlPatterns: ["ROW_NUMBER", "row_number", "RANK", "rank", "DENSE_RANK", "dense_rank"],
    description: "ROW_NUMBER() 或 RANK()",
  },
  {
    keyword: "前 5",
    label: "Top 5",
    sqlPatterns: ["ROW_NUMBER", "row_number", "LIMIT", "limit", "TOP", "top"],
    description: "ROW_NUMBER() + WHERE 或 LIMIT 5",
  },
  {
    keyword: "前5",
    label: "Top 5",
    sqlPatterns: ["ROW_NUMBER", "row_number", "LIMIT", "limit", "TOP", "top"],
    description: "ROW_NUMBER() + WHERE 或 LIMIT 5",
  },
  {
    keyword: "年份",
    label: "按年份",
    sqlPatterns: ["YEAR(", "year(", "strftime", "EXTRACT", "extract"],
    description: "年份提取或分组",
  },
  {
    keyword: "地区",
    label: "按地区",
    sqlPatterns: ["region", "area", "location", "province", "city"],
    description: "地区字段分组",
  },
];

interface MetricCoverage {
  requirement: string;
  completed: boolean;
  fieldOrCalculation: string;
  note: string;
}

/**
 * Extract metric requirements from user question.
 */
export function extractRequestedMetrics(question: string): string[] {
  const found: string[] = [];
  for (const req of METRIC_REQUIREMENTS) {
    if (question.includes(req.keyword)) {
      if (!found.includes(req.label)) {
        found.push(req.label);
      }
    }
  }
  return found;
}

/**
 * Evaluate metric coverage by checking SQL content.
 */
export function evaluateMetricCoverage(
  question: string,
  sql: string,
  _schema?: string
): MetricCoverage[] {
  const requested = extractRequestedMetrics(question);
  if (requested.length === 0) {
    return [];
  }

  const sqlLower = sql.toLowerCase();
  const coverage: MetricCoverage[] = [];

  for (const label of requested) {
    const req = METRIC_REQUIREMENTS.find((r) => r.label === label);
    if (!req) continue;

    const hasPattern = req.sqlPatterns.some((p) => sqlLower.includes(p.toLowerCase()));

    coverage.push({
      requirement: label,
      completed: hasPattern,
      fieldOrCalculation: hasPattern ? req.description : `SQL 中未包含 ${req.description}`,
      note: hasPattern ? "" : `用户要求 "${label}"，但 SQL 未计算该指标`,
    });
  }

  return coverage;
}

// ── Table formatting ───────────────────────────────────────────────

/**
 * Format rows as a markdown table.
 * Limits to maxRows and truncates long cell values.
 */
export function formatMarkdownTable(
  columns: string[],
  data: Record<string, unknown>[],
  maxRows: number = 20,
  maxCellLength: number = 50
): string {
  if (!columns || columns.length === 0) return "";
  if (!data || data.length === 0) return "";

  const rows = data.slice(0, maxRows);
  const truncated = data.length > maxRows;

  const truncate = (val: unknown): string => {
    if (val === null || val === undefined) return "NULL";
    const str = String(val);
    return str.length > maxCellLength ? str.slice(0, maxCellLength) + "..." : str;
  };

  const lines: string[] = [];

  // Header
  lines.push(`| ${columns.join(" | ")} |`);
  lines.push(`| ${columns.map(() => "---").join(" | ")} |`);

  // Rows
  for (const row of rows) {
    const cells = columns.map((col) => truncate(row[col]));
    lines.push(`| ${cells.join(" | ")} |`);
  }

  if (truncated) {
    lines.push("");
    lines.push(`> 显示前 ${maxRows} 行，共 ${data.length} 行`);
  }

  return lines.join("\n");
}

// ── Summary builders ───────────────────────────────────────────────

/**
 * Build executive summary from run data.
 */
export function buildExecutiveSummary(run: AnalysisRun): string {
  // Try to find summary from sections
  const summarySection = run.sections.find(
    (s) => s.title.toLowerCase().includes("summary") || s.title.includes("摘要")
  );
  if (summarySection && summarySection.content.trim()) {
    return summarySection.content;
  }

  // Try multiResult summary
  if (run.multiResult?.summary) {
    return run.multiResult.summary;
  }

  // Build from step results
  if (run.multiResult?.steps && run.multiResult.steps.length > 0) {
    const successSteps = run.multiResult.steps.filter((s) => s.status === "success");
    const totalRows = successSteps.reduce((sum, s) => sum + (s.row_count ?? s.data?.length ?? 0), 0);

    if (successSteps.length > 0) {
      return [
        `本次分析执行了 ${run.multiResult.steps.length} 个步骤，其中 ${successSteps.length} 个成功。`,
        `共查询到 ${totalRows} 行数据。`,
        run.multiResult.plan?.[0]?.purpose ? `主要分析目标：${run.multiResult.plan[0].purpose}` : "",
      ]
        .filter(Boolean)
        .join(" ");
    }
  }

  // Fallback
  return "当前分析生成了 SQL 和查询结果，但缺少足够的摘要信息，因此只能给出有限结论。请结合下方结果表进一步判断。";
}

/**
 * Build key findings from run data.
 */
export function buildKeyFindings(run: AnalysisRun): string[] {
  // Try to find findings from sections
  const findingsSection = run.sections.find(
    (s) =>
      s.title.toLowerCase().includes("finding") ||
      s.title.includes("发现") ||
      s.title.includes("洞察") ||
      s.title.toLowerCase().includes("key")
  );
  if (findingsSection && findingsSection.content.trim()) {
    // Split by bullet points or newlines
    const findings = findingsSection.content
      .split(/\n/)
      .map((line) => line.replace(/^[-*•]\s*/, "").trim())
      .filter((line) => line.length > 0);
    if (findings.length > 0) {
      return findings;
    }
  }

  // Try to extract from multiResult steps
  if (run.multiResult?.steps) {
    const successSteps = run.multiResult.steps.filter((s) => s.status === "success");
    const findings: string[] = [];

    for (const step of successSteps) {
      if (step.row_count !== undefined && step.row_count > 0) {
        findings.push(`Step ${step.step}: ${step.purpose} — 返回 ${step.row_count} 行`);
      }
    }

    if (findings.length > 0) {
      return findings;
    }
  }

  // Fallback
  return ["当前分析未能生成可靠业务发现，请结合下方结果表进一步判断。"];
}

/**
 * Get final result data from the last successful step.
 */
function getFinalResult(run: AnalysisRun): {
  columns: string[];
  data: Record<string, unknown>[];
  rowCount: number;
  hasData: boolean;
} {
  if (!run.multiResult?.steps || run.multiResult.steps.length === 0) {
    return { columns: [], data: [], rowCount: 0, hasData: false };
  }

  // Find last successful step with data
  const successSteps = run.multiResult.steps.filter((s) => s.status === "success");
  const lastStep = successSteps[successSteps.length - 1];

  if (!lastStep) {
    return { columns: [], data: [], rowCount: 0, hasData: false };
  }

  const hasData = lastStep.data && lastStep.data.length > 0;
  return {
    columns: lastStep.columns || [],
    data: lastStep.data || [],
    rowCount: lastStep.row_count ?? lastStep.data?.length ?? 0,
    hasData,
  };
}

// ── Main export ────────────────────────────────────────────────────

/**
 * Convert an AnalysisRun to a markdown report string.
 */
export function runToMarkdown(run: AnalysisRun): string {
  const lines: string[] = [];

  // Title
  lines.push("# AI 数据分析报告");
  lines.push("");

  // 1. 用户问题
  lines.push("## 1. 用户问题");
  lines.push("");
  lines.push(run.question || "（无问题描述）");
  lines.push("");

  // 2. 数据表
  if (run.table) {
    lines.push("## 2. 数据表");
    lines.push("");
    lines.push(run.table);
    lines.push("");
  }

  // 3. 执行摘要
  lines.push("## 3. 执行摘要");
  lines.push("");
  lines.push(buildExecutiveSummary(run));
  lines.push("");

  // 4. 关键发现
  lines.push("## 4. 关键发现");
  lines.push("");
  const findings = buildKeyFindings(run);
  for (const finding of findings) {
    lines.push(`- ${finding}`);
  }
  lines.push("");

  // 5. 最终结果
  lines.push("## 5. 最终结果");
  lines.push("");
  const result = getFinalResult(run);
  if (result.hasData) {
    lines.push(formatMarkdownTable(result.columns, result.data, 20));
  } else if (result.rowCount > 0) {
    lines.push(
      "当前记录未保存完整结果行，仅保存了 SQL、状态和行数；建议后续增强结果持久化。"
    );
  } else {
    lines.push("当前查询结果为空。");
  }
  lines.push("");

  // 6. 指标完成情况
  lines.push("## 6. 指标完成情况");
  lines.push("");

  // Get the final SQL for metric coverage check
  const finalSql =
    run.multiResult?.steps
      ?.filter((s) => s.status === "success")
      .map((s) => s.sql)
      .join("\n") || "";

  const coverage = evaluateMetricCoverage(run.question, finalSql);
  if (coverage.length > 0) {
    lines.push("| 用户要求 | 是否完成 | 对应字段 / 计算方式 | 说明 |");
    lines.push("|---|---|---|---|");
    for (const c of coverage) {
      lines.push(
        `| ${c.requirement} | ${c.completed ? "是" : "否"} | ${c.fieldOrCalculation} | ${c.note} |`
      );
    }
  } else {
    lines.push("用户问题中未提取到明确的指标要求。");
  }
  lines.push("");

  // 7. 未满足项 / 缺失字段说明
  lines.push("## 7. 未满足项 / 缺失字段说明");
  lines.push("");
  const unmet = coverage.filter((c) => !c.completed);
  if (unmet.length > 0) {
    for (const u of unmet) {
      lines.push(`- ${u.note}`);
    }
  } else if (coverage.length > 0) {
    lines.push("本次分析已覆盖用户问题中的主要指标要求。");
  } else {
    lines.push("用户问题中未提取到明确的指标要求，无法判断完成情况。");
  }
  lines.push("");

  // 8. 分析步骤
  if (run.multiResult?.steps && run.multiResult.steps.length > 0) {
    lines.push("## 8. 分析步骤");
    lines.push("");
    for (let i = 0; i < run.multiResult.steps.length; i++) {
      const step = run.multiResult.steps[i];
      const planStep = run.multiResult.plan?.[i];
      lines.push(`### Step ${step.step || i + 1}: ${step.purpose || planStep?.purpose || ""}`);
      lines.push("");
      lines.push(`- 状态：${step.status === "success" ? "✓ 成功" : "✗ 失败"}`);
      if (step.row_count !== undefined) {
        lines.push(`- 行数：${step.row_count}`);
      }
      if (step.error) {
        lines.push(`- 错误：${step.error}`);
      }
      lines.push("");
    }
  }

  // 9. SQL 附录
  const allSqls =
    run.multiResult?.steps?.filter((s) => s.sql).map((s) => ({ step: s.step, sql: s.sql })) || [];
  if (allSqls.length > 0) {
    lines.push("## 9. SQL 附录");
    lines.push("");
    for (const { step, sql } of allSqls) {
      lines.push(`### Step ${step}`);
      lines.push("");
      lines.push("```sql");
      lines.push(sql);
      lines.push("```");
      lines.push("");
    }
  }

  // 10. 调用追踪 Trace
  if (run.trace) {
    lines.push("## 10. 调用追踪 Trace");
    lines.push("");
    lines.push(`- LLM 调用次数：${run.trace.total_llm_calls}`);
    lines.push(`- 输入 Token：${run.trace.total_input_tokens}`);
    lines.push(`- 输出 Token：${run.trace.total_output_tokens}`);
    if (run.trace.events && run.trace.events.length > 0) {
      const totalLatency = run.trace.events.reduce((sum, e) => sum + (e.latency_ms || 0), 0);
      lines.push(`- 总耗时：${(totalLatency / 1000).toFixed(1)}s`);
    }
    if (run.trace.guardrail_violations.length > 0) {
      lines.push(`- 质量警告：${run.trace.guardrail_violations.length} 条`);
    }
    lines.push("");
  }

  // 11. 生成时间
  lines.push("## 11. 生成时间");
  lines.push("");
  lines.push(formatLocalDateTime(run.timestamp));
  lines.push("");

  return lines.join("\n");
}
