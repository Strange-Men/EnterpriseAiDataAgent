/**
 * Markdown export utility for AI analysis reports.
 *
 * Generates a structured markdown document from an AnalysisRun,
 * suitable for sharing with non-technical stakeholders.
 */

import type { AnalysisRun } from "@/stores/analysis-store";
import { formatLocalDateTime } from "@/utils/datetime";

/**
 * Convert an AnalysisRun to a markdown report string.
 */
export function runToMarkdown(run: AnalysisRun): string {
  const lines: string[] = [];

  // Title
  lines.push("# AI 数据分析报告");
  lines.push("");

  // Question
  lines.push("## 问题");
  lines.push("");
  lines.push(run.question || "（无问题描述）");
  lines.push("");

  // Table
  if (run.table) {
    lines.push("## 数据表");
    lines.push("");
    lines.push(run.table);
    lines.push("");
  }

  // Executive summary
  const summarySection = run.sections.find(
    (s) => s.title.toLowerCase().includes("summary") || s.title.includes("摘要")
  );
  if (summarySection) {
    lines.push("## 执行摘要");
    lines.push("");
    lines.push(summarySection.content);
    lines.push("");
  }

  // Key findings
  const findingsSection = run.sections.find(
    (s) => s.title.toLowerCase().includes("finding") || s.title.includes("发现") || s.title.includes("洞察")
  );
  if (findingsSection) {
    lines.push("## 关键发现");
    lines.push("");
    lines.push(findingsSection.content);
    lines.push("");
  }

  // Analysis steps
  if (run.multiResult?.steps && run.multiResult.steps.length > 0) {
    lines.push("## 分析步骤");
    lines.push("");
    for (let i = 0; i < run.multiResult.steps.length; i++) {
      const step = run.multiResult.steps[i];
      const planStep = run.multiResult.plan?.[i];
      lines.push(`### Step ${step.step || i + 1}: ${step.purpose || planStep?.purpose || ""}`);
      lines.push("");
      lines.push(`- 状态：${step.status === "success" ? "成功" : "失败"}`);
      if (step.row_count !== undefined) {
        lines.push(`- 行数：${step.row_count}`);
      }
      if (step.error) {
        lines.push(`- 错误：${step.error}`);
      }
      if (step.sql) {
        lines.push("- SQL：");
        lines.push("```sql");
        lines.push(step.sql);
        lines.push("```");
      }
      lines.push("");
    }
  }

  // Other sections (excluding already-rendered ones)
  const renderedTitles = new Set([
    summarySection?.title,
    findingsSection?.title,
  ].filter(Boolean));

  const otherSections = run.sections.filter((s) => !renderedTitles.has(s.title));
  if (otherSections.length > 0) {
    lines.push("## 详细分析");
    lines.push("");
    for (const section of otherSections) {
      lines.push(`### ${section.title}`);
      lines.push("");
      lines.push(section.content);
      lines.push("");
    }
  }

  // Trace summary
  if (run.trace) {
    lines.push("## 调用追踪");
    lines.push("");
    lines.push(`- 总 LLM 调用：${run.trace.total_llm_calls}`);
    lines.push(`- 输入 Token：${run.trace.total_input_tokens}`);
    lines.push(`- 输出 Token：${run.trace.total_output_tokens}`);
    if (run.trace.guardrail_violations.length > 0) {
      lines.push(`- 质量警告：${run.trace.guardrail_violations.length} 条`);
    }
    lines.push("");
  }

  // Generation time
  lines.push("## 生成时间");
  lines.push("");
  lines.push(formatLocalDateTime(run.timestamp));
  lines.push("");

  return lines.join("\n");
}
